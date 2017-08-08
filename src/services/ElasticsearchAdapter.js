export default class ElasticsearchAdapter {
  client

  /**
   * Defaults used in each request
   * @type {{requestTimeout: number}}
   */
  requestDefaults = {
    requestTimeout: 3000,
    format: 'json'
  }

  constructor (client) {
    this.client = client
  }

  ping () {
    return this.client.ping(this.requestDefaults)
  }

  getClientInfo () {
    return this.client.info(this.requestDefaults)
  }

  getCatIndices () {
    return this.client.cat.indices(this.requestDefaults)
  }
}
