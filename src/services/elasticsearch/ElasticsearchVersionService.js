import { ELASTICSEARCH_API_VERSIONS } from '../../consts'
import { extractUrlCredsToAuthHeader } from '../../helpers'

export default class ElasticsearchVersionService {
  constructor (host) {
    this.host = host
    this.apiVersion = '0'
  }

  getApiVersion () {
    return this.getRawApiVersion().then(() => this.mapApiVersion())
  }

  /**
   * getRawApiVersion
   * Returns the api version of a running elasticsearch at +host+
   * @returns {Promise<version>}
   */
  getRawApiVersion () {
    const options = extractUrlCredsToAuthHeader(this.host)
    return fetch(options.url, {headers: options.header})
      .then(response => response.json())
      .then(json => {
        this.apiVersion = json.version.number.slice(0, 3)
      })
  }

  mapApiVersion () {
    switch (this.apiVersion) {
    case ELASTICSEARCH_API_VERSIONS:
      return this.apiVersion
    case '6.1':
      return '6.x'
    default:
      return '6.x'
    }
  }
}
