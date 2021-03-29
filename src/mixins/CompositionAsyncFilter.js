import * as Comlink from 'comlink'
import Worker from 'worker-loader!@/workers/FuzzyFilter'
import { onBeforeUnmount, ref } from '@vue/composition-api'

export const useAsyncFilter = () => {
  const filterLoading = ref(false)

  const threads = Math.min(navigator.hardwareConcurrency / 2, 4) || 2
  let workers = Array.from(Array(threads)).map(() => (new Worker()))
  const workerClasses = workers.map(w => {
    const FuzzyFilter = Comlink.wrap(w)
    return new FuzzyFilter()
  })

  onBeforeUnmount(() => {
    workers.forEach(w => w.terminate())
    workers = null
  })

  const filterTable = (items, search, headers) => {
    if (search.length === 0) return items

    return new Promise(resolve => {
      const nestedItems = splitArray(items, threads)
      filterLoading.value = true

      const jobs = workerClasses.map(async (FuzzyFilter, i) => {
        const instance = await FuzzyFilter
        return instance.filter(nestedItems[i], search, headers)
      })
      return Promise.all(jobs).then(values => {
        filterLoading.value = false
        const flatValues = [].concat.apply([], values)
        return resolve(flatValues)
      })
    })
  }

  return {
    filterTable,
    filterLoading
  }
}

const splitArray = (arr, size) => {
  const groupSize = Math.ceil(arr.length / size)
  return Array.from(Array(size)).map((_, i) => {
    return arr.slice(groupSize * i, groupSize * (i + 1))
  })
}
