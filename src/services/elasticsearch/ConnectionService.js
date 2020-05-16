import ElasticsearchAdapter, { Es7Client } from '../ElasticsearchAdapter'

export default class ConnectionService {
  constructor (host) {
    this.host = host[host.length - 1] === '/' ? host : host + '/'
  }

  async getAdapter () {
    return new ElasticsearchAdapter(new Es7Client(this.host))
  }

  async testConnection () {
    try {
      let adapter = await this.getAdapter()
      await adapter.ping()
      await adapter.search({ size: 0 })
      return adapter
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
