import { ref, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { histogramAggregation, parseTime } from '../../../helpers/search/timeRange.ts'
import type { SearchTimeBounds } from '../../../types/search.ts'

export type HistogramBucket = { key: number; doc_count: number }

type HistogramRequest = {
  index: string
  query: unknown
  field: string
  range: SearchTimeBounds | null
  fixedInterval: boolean
}

export const useSearchHistogram = () => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const buckets = shallowRef<HistogramBucket[]>([])
  const interval = ref('')
  let latest = 0

  const boundsFor = async ({ index, query, field, range }: HistogramRequest) => {
    if (range) {
      const now = Date.now()
      const min = parseTime(range.from, now)
      const max = parseTime(range.to, now)
      return min !== null && max !== null ? { min, max } : null
    }

    const aggs = { min: { min: { field } }, max: { max: { field } } }
    const result = await callElasticsearch('search', { size: 0, query, aggs }, index)
    const min = Number(result?.aggregations?.min?.value ?? NaN)
    const max = Number(result?.aggregations?.max?.value ?? NaN)
    return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null
  }

  const clear = () => {
    latest++
    buckets.value = []
  }

  const load = async (request: HistogramRequest) => {
    const current = ++latest
    try {
      const bounds = await boundsFor(request)
      if (current !== latest) return
      if (!bounds) return clear()

      const histogram = histogramAggregation(request.field, bounds, { fixedInterval: request.fixedInterval })
      const body = { size: 0, query: request.query, aggs: { histogram: histogram.aggregation } }
      const result = await callElasticsearch('search', body, request.index)
      if (current !== latest) return

      interval.value = histogram.interval
      buckets.value = result?.aggregations?.histogram?.buckets ?? []
    } catch (_e) {
      if (current === latest) buckets.value = []
    }
  }

  return { buckets, interval, requestState, load, clear }
}
