import { DEFAULT_SEARCH_RESULT_COLUMNS } from '../consts'

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
    if (result._source) this.columns = this.columns.concat(Object.keys(result._source))
    this.indices.push(result._index)

    const el = Object.assign({}, result, result._source)
    delete el._source
    this.docs.push(el)
  }
}
