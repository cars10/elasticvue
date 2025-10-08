import { computed } from 'vue'

type RefLike = {
  value: any[]
}

export const setupFilterState = (results: RefLike, filteredResults: RefLike) => {
  const resultsCount = computed(() => results.value.length)
  const filteredResultsCount = computed(() => filteredResults.value.length)

  return {
    resultsCount,
    filteredResultsCount
  }
}
