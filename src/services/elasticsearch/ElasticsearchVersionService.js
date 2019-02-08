import { ELASTICSEARCH_API_VERSIONS } from '../../consts'
import { buildFetchAuthHeaderFromUrl, urlWithoutCredentials } from '../../helpers'

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
    return fetch(urlWithoutCredentials(this.host), { headers: buildFetchAuthHeaderFromUrl(this.host) })
      .then(response => response.json())
      .then(json => {
        this.apiVersion = json.version.number.slice(0, 3)
      })
  }

  mapApiVersion () {
    switch (this.apiVersion) {
    case '6.1':
      return '6.x'
    default:
      return this.apiVersion
    }
  }
}
