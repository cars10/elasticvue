import { DEFAULT_SEARCH_RESULT_COLUMNS } from '../consts'

const RENAMED_ID = ' id'

export default class SearchResults {
  columns: string[]
  indices: string[]
  uniqueColumns: string[]
  uniqueIndices: string[]
  docs: any[]

  constructor (results: any[]) {
    this.columns = DEFAULT_SEARCH_RESULT_COLUMNS.slice()
    this.indices = []
    this.docs = []

    results.forEach(result => this.add(result))
    this.uniqueColumns = Array.from(new Set(this.columns))
    this.uniqueIndices = Array.from(new Set(this.indices))
  }

  add (result: any) {
    let key = '_source'
    if (!result._source && result.fields) key = 'fields'
    if (result[key]) {
      const newKeys = Object.keys(result[key])
      const idIndex = newKeys.indexOf('id')
      if (idIndex > -1 && !this.columns.includes(RENAMED_ID)) {
        newKeys.splice(idIndex, 1)
        newKeys.push(RENAMED_ID)
      }
      this.columns = this.columns.concat(newKeys)
    }
    this.indices.push(result._index)

    const el = Object.assign({}, result, result[key])
    if (!el._type) el._type = '_doc'
    delete el[key]

    if (el.hasOwnProperty('id')) {
      el[RENAMED_ID] = el.id
      delete el.id
    }
    this.docs.push(el)
  }
}
