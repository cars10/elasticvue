import { buildFetchAuthHeaderFromUrl, urlWithoutCredentials } from '../../helpers'

export default class ElasticsearchVersionService {
  constructor (host) {
    this.host = host
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
        return json.version.number.slice(0, 3)
      })
  }
}
