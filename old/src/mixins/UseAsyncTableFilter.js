import * as Comlink from 'comlink'
import Worker from 'worker-loader!@/workers/FilterWorker'
import { onBeforeUnmount, ref } from 'vue'

export const useAsyncFilter = () => {
  const filterLoading = ref(false)

  const threads = 2
  let workers = Array.from(Array(threads)).map(() => (new Worker()))
  const workerClasses = workers.map(w => {
    const WorkerClass = Comlink.wrap(w)
    return new WorkerClass()
  })

  onBeforeUnmount(() => {
    workers.forEach(w => w.terminate())
    workers = null
  })

  const asyncFilterTable = (items, searchQuery, headers) => {
    const search = searchQuery.toString().slice().toLowerCase().trim()
    if (search.length === 0) return items

    return new Promise(resolve => {
      const nestedItems = splitArray(items, threads)
      filterLoading.value = true

      const jobs = workerClasses.map(async (TableFilterWorker, i) => {
        const instance = await TableFilterWorker
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
    asyncFilterTable,
    filterLoading
  }
}

const splitArray = (arr, size) => {
  const groupSize = Math.ceil(arr.length / size)
  return Array.from(Array(size)).map((_, i) => {
    return arr.slice(groupSize * i, groupSize * (i + 1))
  })
}
