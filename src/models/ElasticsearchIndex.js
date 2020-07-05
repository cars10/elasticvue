import prettyBytes from 'pretty-bytes'

export default class ElasticsearchIndex {
  constructor (options) {
    this.index = options.index
    this.health = options.health
    this.status = options.status
    this.uuid = options.uuid
    this.pri = options.pri
    this.parsedPri = parseIntValue(options.pri)
    this.rep = options.rep
    this.parsedRep = parseIntValue(options.rep)
    this.docsCount = options['docs.count']
    this.parsedDocsCount = parseIntValue(options['docs.count'])
    this.storeSize = options['store.size']
    this.parsedStoreSize = parseIntValue(options['store.size'])
    this.humanStoreSize = prettyPrintByteString(this.parsedStoreSize)
  }
}

function parseIntValue (value) {
  if (typeof value === 'string') {
    try {
      return parseInt(value)
    } catch (error) {
      return value
    }
  } else {
    return null
  }
}

function prettyPrintByteString (value) {
  if (!value) return ''

  if (typeof value === 'number' && !isNaN(value)) {
    return prettyBytes(value)
  } else {
    return `${value} B`
  }
}
