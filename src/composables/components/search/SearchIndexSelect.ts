import { computed, onMounted, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useConnectionStore } from '../../../store/connection.ts'
import { elasticsearchCompatibleVersion, versionAtLeast } from '../../../helpers/minClusterVersion.ts'
import { matchesAllTerms } from '../../../helpers/filters.ts'

export type IndexTargetKind = 'index' | 'alias' | 'data_stream'
export type IndexTargetOption = { name: string; kind: IndexTargetKind; hidden: boolean }

type EsResolveIndex = {
  indices?: { name: string; attributes?: string[] }[]
  aliases?: { name: string }[]
  data_streams?: { name: string }[]
}

const OPTIONS_LIMIT = 200
const CACHE_TTL = 60_000

const cache = new Map<string, { at: number; options: Promise<IndexTargetOption[]> }>()

export const resolveOptions = (body: EsResolveIndex): IndexTargetOption[] => [
  ...(body.data_streams || []).map(({ name }) => ({ name, kind: 'data_stream' as const, hidden: name.startsWith('.') })),
  ...(body.aliases || []).map(({ name }) => ({ name, kind: 'alias' as const, hidden: name.startsWith('.') })),
  ...(body.indices || []).map(({ name, attributes }) => ({
    name,
    kind: 'index' as const,
    hidden: name.startsWith('.') || !!attributes?.includes('hidden')
  }))
]

export const filterOptions = (options: IndexTargetOption[], query: string, limit = OPTIONS_LIMIT) => {
  const showHidden = query.trim().startsWith('.')
  const result: IndexTargetOption[] = []

  for (const option of options) {
    if ((showHidden || !option.hidden) && matchesAllTerms(option.name, query)) result.push(option)
    if (result.length >= limit) break
  }

  return result
}

export const useSearchIndexSelect = () => {
  const connectionStore = useConnectionStore()
  const { callElasticsearch } = useElasticsearchAdapter()

  const options = shallowRef<IndexTargetOption[]>([])
  const filtered = shallowRef<IndexTargetOption[]>([])
  const kinds = computed(() => new Map(options.value.map((option) => [option.name, option.kind])))

  const fetchOptions = async (): Promise<IndexTargetOption[]> => {
    const version = elasticsearchCompatibleVersion(connectionStore.activeCluster?.version, connectionStore.elasticsearch)
    if (versionAtLeast(version, '7.9')) {
      try {
        return resolveOptions(await callElasticsearch('resolveIndex', { name: '*', params: { expand_wildcards: 'all' } }))
      } catch (_e) {}
    }

    const [indices, aliases] = await Promise.allSettled([
      callElasticsearch('catIndices', { h: 'index' }) as Promise<{ index: string }[]>,
      callElasticsearch('catAliases', { h: 'alias' }) as Promise<{ alias: string }[]>
    ])
    const aliasNames = aliases.status === 'fulfilled' ? [...new Set(aliases.value.map((a) => a.alias))] : []
    const indexNames = indices.status === 'fulfilled' ? indices.value.map((i) => i.index).sort() : []
    return resolveOptions({ aliases: aliasNames.map((name) => ({ name })), indices: indexNames.map((name) => ({ name })) })
  }

  const loadOptions = async () => {
    const key = connectionStore.activeCluster?.uuid || ''
    const cached = cache.get(key)
    if (!cached || Date.now() - cached.at > CACHE_TTL) cache.set(key, { at: Date.now(), options: fetchOptions() })
    options.value = await cache.get(key)!.options
  }

  const filter = (query: string, update: (fn: () => void) => void) =>
    update(() => (filtered.value = filterOptions(options.value, query)))

  onMounted(loadOptions)

  return { filtered, filter, kindOf: (name: string) => kinds.value.get(name) }
}
