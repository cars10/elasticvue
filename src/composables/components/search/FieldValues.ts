import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useClusterSession } from '../../../store/clusterSession.ts'
import { fieldValuesBody } from '../../../helpers/search/fieldValues.ts'
import type { FieldCatalog, SearchTimeRange } from '../../../types/search.ts'

const CACHE_TTL = 60_000
const NO_VALUE_TYPES = ['date', 'date_nanos']

const cache = new Map<string, { at: number; values: Promise<string[]> }>()

export const valuesFieldFor = (catalog: FieldCatalog, field: string) => {
  const info = catalog[field]
  if (!info || info.types.some((type) => NO_VALUE_TYPES.includes(type))) return null
  return info.sortField
}

export const useFieldValues = () => {
  const session = useClusterSession()
  const { callElasticsearch } = useElasticsearchAdapter()

  const fetchValues = async (index: string, field: string, time: SearchTimeRange | null): Promise<string[]> => {
    const body = fieldValuesBody({ field, time, capabilities: session.capabilities.search })
    const result = await callElasticsearch((es) => es.search(body, index))
    const buckets: { key: unknown; key_as_string?: string }[] = result?.aggregations?.values?.buckets ?? []
    return buckets.map((bucket) => String(bucket.key_as_string ?? bucket.key))
  }

  const loadValues = (
    index: string,
    field: string,
    catalog: FieldCatalog,
    time: SearchTimeRange | null = null
  ): Promise<string[]> => {
    const valuesField = valuesFieldFor(catalog, field)
    if (!valuesField) return Promise.resolve([])

    const key = [session.connectionId, index, valuesField, time?.field, time?.from, time?.to].join('|')
    const cached = cache.get(key)
    if (!cached || Date.now() - cached.at > CACHE_TTL) {
      const values = fetchValues(index, valuesField, time).catch(() => {
        cache.delete(key)
        return []
      })
      cache.set(key, { at: Date.now(), values })
    }
    return cache.get(key)!.values
  }

  return { loadValues }
}
