export default class ElasticsearchIndex {
  constructor (options) {
    this.index = options.index
    this.health = options.health
    this.status = options.status
    this.uuid = options.uuid
    this.pri = options.pri
    this.parsedPri = ElasticsearchIndex.parseFloatValue(options.pri)
    this.rep = options.rep
    this.parsedRep = ElasticsearchIndex.parseFloatValue(options.rep)
    this.docsCount = options['docs.count']
    this.parsedDocsCount = ElasticsearchIndex.parseFloatValue(options['docs.count'])
    this.storeSize = options['store.size']
    this.parsedStoreSize = ElasticsearchIndex.parseFloatValue(options['store.size'])
    this.priStoreSize = options['pri.store.size']
    this.parsedPriStoreSize = ElasticsearchIndex.parseFloatValue(options['pri.store.size'])
  }

  static parseFloatValue (value) {
    try {
      return parseFloat(value)
    } catch (error) {
      return value
    }
  }
}
