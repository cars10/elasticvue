export default class Results {
  constructor (results) {
    this.columns = ['_index', '_type', '_id', '_score']
    this.indices = []

    results.forEach(result => this.add(result))
    this.uniqueColumns = Array.from(new Set(this.columns))
    this.uniqueIndices = Array.from(new Set(this.indices))
  }

  add (result) {
    if (result._source) this.columns = this.columns.concat(Object.keys(result._source))
    this.indices.push(result._index)
  }
}
