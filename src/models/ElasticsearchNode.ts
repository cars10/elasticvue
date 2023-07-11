import { EsNode } from '../types/types.ts'

export default class ElasticsearchNode {
  name: string
  id: string
  ip: string
  heapPercent: string
  heapCurrent: string
  heapMax: string
  ramPercent: string
  ramCurrent: string
  ramMax: string
  diskPercent: string
  diskCurrent: string
  diskMax: string
  cpu: string
  load_1m: string
  load_5m: string
  load_15m: string
  nodeRole: string
  master: boolean
  masterEligible: boolean
  dataNode: boolean
  ingestNode: boolean
  coordinatingNode: boolean

  constructor (options: EsNode) {
    this.name = options.name
    this.id = options.id
    this.ip = options.ip
    this.heapPercent = options['heap.percent']
    this.heapCurrent = options['heap.current']
    this.heapMax = options['heap.max']
    this.ramPercent = options['ram.percent']
    this.ramCurrent = options['ram.current']
    this.ramMax = options['ram.max']
    this.diskPercent = options['disk.used_percent']
    this.diskCurrent = options['disk.used']
    this.diskMax = options['disk.total']
    this.cpu = options.cpu
    this.load_1m = options.load_1m
    this.load_5m = options.load_5m
    this.load_15m = options.load_15m
    this.nodeRole = options['node.role']

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
