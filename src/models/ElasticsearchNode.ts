import { EsNode } from '../types/types.ts'

export default class ElasticsearchNode {
  name: string
  version: string
  id: string
  ip: string
  heapPercent: number
  heapCurrent: string
  heapMax: string
  ramPercent: number
  ramCurrent: string
  ramMax: string
  diskPercent: number
  diskCurrent: string
  diskMax: string
  cpu: number
  load_1m: string
  load_5m: string
  load_15m: string
  nodeRole: string
  master: boolean
  masterEligible: boolean
  dataNode: boolean
  ingestNode: boolean
  coordinatingNode: boolean
  attributes: Record<string, string>

  constructor (options: EsNode) {
    this.name = options.name
    this.version = options.version
    this.id = options.id
    this.ip = options.ip
    this.heapPercent = parseFloatValue(options['heap.percent'])
    this.heapCurrent = options['heap.current']
    this.heapMax = options['heap.max']
    this.ramPercent = parseFloatValue(options['ram.percent'])
    this.ramCurrent = options['ram.current']
    this.ramMax = options['ram.max']
    this.diskPercent = parseFloatValue(options['disk.used_percent'])
    this.diskCurrent = options['disk.used']
    this.diskMax = options['disk.total']
    this.cpu = parseFloatValue(options.cpu)
    this.load_1m = options.load_1m
    this.load_5m = options.load_5m
    this.load_15m = options.load_15m
    this.nodeRole = options['node.role']
    this.attributes = options.attributes

    this.masterEligible = false
    this.dataNode = false
    this.ingestNode = false
    this.coordinatingNode = false

    this.master = options.master === '*'
    this.setRoles(options['node.role'])
  }

  setRoles (roles: string) {
    this.masterEligible = roles.includes('m')
    this.dataNode = roles.includes('d')
    this.ingestNode = roles.includes('i')
    this.coordinatingNode = roles === '-'
  }
}

function parseFloatValue (value: string) {
  try {
    return parseFloat(value)
  } catch (error) {
    return -1
  }
}