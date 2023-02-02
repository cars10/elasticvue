export default class ElasticsearchNode {
  constructor (options) {
    this.name = options.name
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

    this.master = options.master === '*'
    this.setRoles(options['node.role'])
  }

  setRoles (roles) {
    this.masterEligible = roles.includes('m')
    this.dataNode = roles.includes('d')
    this.ingestNode = roles.includes('i')
    this.coordinatingNode = roles === '-'
  }
}
