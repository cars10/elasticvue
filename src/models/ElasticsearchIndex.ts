import { EsIndex } from '../composables/components/indices/IndicesTable.ts'
import { prettyPrintByteString } from '../helpers/bytes.ts'

export default class ElasticsearchIndex {
  index: string
  health: string
  status: string
  uuid: string
  pri: string
  parsedPri: number | string
  rep: string
  parsedDocsCount: number | string
  storeSize: string
  parsedStoreSize: number | string
  humanStoreSize: string
  parsedSegmentsCount: number | string
  created: number | string

  constructor (options: EsIndex) {
    this.index = options.index
    this.health = options.health
    this.status = options.status
    this.uuid = options.uuid
    this.parsedSegmentsCount = parseIntValue(options.sc)
    this.pri = options.pri
    this.parsedPri = parseIntValue(options.pri)
    this.rep = options.rep
    this.parsedDocsCount = parseIntValue(options['docs.count'])
    this.storeSize = options['store.size']
    this.parsedStoreSize = parseIntValue(options['store.size'])
    this.humanStoreSize = prettyPrintByteString(this.parsedStoreSize)
    this.created = parseIntValue(options.cd)
  }
}

function parseIntValue (value: string) {
  if (!value) return ''

  try {
    return parseInt(value)
  } catch (_e) {
    return value
  }
}
