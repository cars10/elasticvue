import ElasticsearchAdapter from '../ElasticsearchAdapter'
import ElasticsearchVersionService from './ElasticsearchVersionService'
import { buildFetchAuthHeaderFromUrl, urlWithoutCredentials } from '@/helpers'

export default class ConnectionService {
  constructor (host) {
    this.host = host
  }

  async getAdapter () {
    let client = await this.buildClient()
    return new ElasticsearchAdapter(client)
  }

  async buildClient () {
    let versionService = new ElasticsearchVersionService(this.host)
    let apiVersion = await versionService.getRawApiVersion()

    return import(/* webpackChunkName: "elasticsearch-js" */ 'elasticsearch').then(Elasticsearch => {
      let clientApi = Object.keys(Elasticsearch.Client.apis).includes(apiVersion) ? apiVersion : '7.1'
      let parsedUrl = new URL(urlWithoutCredentials(this.host))
      return new Elasticsearch.Client({
        host: [
          {
            host: parsedUrl.hostname,
            port: getPort(parsedUrl),
            protocol: parsedUrl.protocol,
            headers: buildFetchAuthHeaderFromUrl(this.host),
            apiVersion: clientApi,
            log: false // process.env.NODE_ENV === 'production' ? false : 'trace'}
          }
        ]
      })
    })
  }

  async testConnection () {
    try {
      let client = await this.buildClient()
      let adapter = new ElasticsearchAdapter(client)
      await adapter.ping()
      await adapter.search({ size: 0 })
      return adapter
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

function getPort (parsedUrl) {
  if (parsedUrl.port) return parsedUrl.port

  if (parsedUrl.protocol === 'https:') {
    return 443
  } else {
    return 80
  }
}
