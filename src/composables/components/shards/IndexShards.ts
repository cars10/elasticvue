import { computed, onMounted, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import {
  CAT_SHARDS_PARAMS,
  convertShards,
  EsShard,
  EsShardIndex,
  problemShards,
  shardNodeName,
  summarizeShards
} from '../../../helpers/shards.ts'
import { isDataNode } from '../../../helpers/nodes.ts'
import { useShardsStore } from '../../../store/shards.ts'
import { useIndicesStore } from '../../../store/indices.ts'
import type { EsNode } from '../../../types/types.ts'

const HEALTH_ORDER: Record<string, number> = { red: 0, yellow: 1, green: 2 }

const filterIndices = (indices: EsShardIndex[], health: string | null): EsShardIndex[] =>
  indices
    .filter((index) => !health || index.health === health)
    .sort((a, b) => (HEALTH_ORDER[a.health] ?? 3) - (HEALTH_ORDER[b.health] ?? 3) || a.index.localeCompare(b.index))

export const useIndexShards = () => {
  const shardsStore = useShardsStore()
  const indicesStore = useIndicesStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()

  const rawShards = shallowRef<EsShard[]>([])
  const indices = shallowRef<EsShardIndex[]>([])
  const nodes = shallowRef<Partial<EsNode>[]>([])

  const shards = computed(() => convertShards(rawShards.value, filterIndices(indices.value, shardsStore.health), nodes.value))

  const dataNodeNames = computed(() =>
    nodes.value
      .filter((node) => node.name && isDataNode(node['node.role'] || '', node.version))
      .map((node) => node.name as string)
  )

  const visibleShards = computed(() => {
    if (indicesStore.showHiddenIndices) return rawShards.value
    const hidden = new RegExp(indicesStore.hideIndicesRegex)
    return rawShards.value.filter((shard) => !hidden.test(shard.index))
  })

  const summary = computed(() => summarizeShards(visibleShards.value, dataNodeNames.value))
  const problems = computed(() => problemShards(visibleShards.value))

  const fetchIndices = () => callEnrichment('catIndices', { h: ['index', 'health', 'pri', 'rep'] }) as Promise<EsShardIndex[]>
  const fetchNodes = () => callEnrichment('catNodes', { h: ['name', 'node.role', 'version'] }) as Promise<Partial<EsNode>[]>

  const load = async () => {
    const [shardsResult, indicesResult, nodesResult] = await Promise.allSettled([
      callElasticsearch('catShards', CAT_SHARDS_PARAMS) as Promise<EsShard[]>,
      fetchIndices(),
      fetchNodes()
    ])

    if (shardsResult.status === 'rejected') {
      console.error(shardsResult.reason)
      return
    }
    const shards = shardsResult.value

    if (indicesResult.status === 'fulfilled') {
      indices.value = indicesResult.value
    } else {
      // Index health is enrichment; still show shards without it
      indices.value = [...new Set(shards.map((shard) => shard.index))].map((index) => ({
        index,
        health: '',
        pri: '',
        rep: ''
      }))
    }

    if (nodesResult.status === 'fulfilled') {
      nodes.value = nodesResult.value
    } else {
      // Node list is enrichment; derive names from shard assignments when missing
      nodes.value = [...new Set(shards.map(shardNodeName).filter((name): name is string => Boolean(name)))].map((name) => ({
        name
      }))
    }

    rawShards.value = shards
  }

  onMounted(load)

  return {
    requestState,
    shards,
    summary,
    problems,
    load
  }
}
