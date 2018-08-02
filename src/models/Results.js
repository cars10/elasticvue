export default class Results {
  constructor (results) {
    this.results = []
    this.columns = []

    results.forEach(result => this.add(result))
    this.uniqueColumns = Array.from(new Set(this.columns))
  }

  add (result) {
    const source = result['_source']
    delete result['_source']
    Object.assign(result, source)
    this._addColumns(Object.keys(result))
    this.results.push(result)
  }

  _addColumns (columns) {
    this.columns = this.columns.concat(columns)
  }
}
