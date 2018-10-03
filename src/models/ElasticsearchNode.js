export default class ElasticsearchNode {
  constructor (options) {
    this.name = options.name
    this.ip = options.ip
    this.heapPercent = options['heap.percent']
    this.ramPercent = options['ram.percent']
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
