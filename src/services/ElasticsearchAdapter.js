export default class ElasticsearchAdapter {
  client

  /**
   * Defaults used in each request
   * @type {{requestTimeout: number}}
   */
  requestDefaults = {
    requestTimeout: 3000
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
}
