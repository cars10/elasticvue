import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
import { DefaultClient } from '@/models/clients/DefaultClient'

export default class ConnectionService {
  constructor (host) {
    this.host = host[host.length - 1] === '/' ? host : host + '/'
  }

  getAdapter () {
    return new ElasticsearchAdapter(new DefaultClient(this.host))
  }

  async testAdapter () {
    try {
      let adapter = this.getAdapter()
      await adapter.ping()
      await adapter.search({ size: 0 })
      return adapter
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
