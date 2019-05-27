import * as Comlink from 'comlink'
import Worker from 'worker-loader!@/workers/FuzzyFilter'

const AsyncFilter = {
  data () {
    return {
      filterLoading: false,
      filterTimerId: null
    }
  },
  created () {
    this.threads = navigator.hardwareConcurrency / 2 || 2
    this.workers = Array.from(Array(this.threads)).map(() => (new Worker()))
    this.workerClasses = this.workers.map(w => {
      const FuzzyFilter = Comlink.wrap(w)
      return new FuzzyFilter()
    })
  },
  beforeDestroy () {
    this.workers.forEach(w => w.terminate())
    this.workers = null
  },
  methods: {
    filterTable (items, search, headers, skipTimeout) {
      if (this.filterTimerId) clearTimeout(this.filterTimerId)
      if (search.length === 0) return items

      return new Promise((resolve, reject) => {
        this.filterTimerId = setTimeout(() => {
          let nestedItems = splitArray(items, this.threads)

          this.filterLoading = true
          let jobs = this.workerClasses.map(async (FuzzyFilter, i) => {
            const instance = await FuzzyFilter
            return instance.filter(nestedItems[i], search, headers)
          })
          return Promise.all(jobs).then(values => {
            this.filterLoading = false
            return resolve(values.flat())
          })
        }, skipTimeout ? 0 : 300)
      })
    }
  }
}

export default AsyncFilter

function splitArray (arr, size) {
  let groupSize = Math.ceil(arr.length / size)
  return Array.from(Array(size)).map((_, i) => {
    return arr.slice(groupSize * i, groupSize * (i + 1))
  })
}
