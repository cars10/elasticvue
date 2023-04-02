import { addTrailingSlash, buildFetchAuthHeader } from '../helpers/elasticsearch_adapter'
import { fetchMethod, REQUEST_DEFAULT_HEADERS } from '../consts'

interface ElasticsearchConfig {
  username: string,
  password: string,
  host: string,
  uri: string
}

interface IndexGetArgs {
  routing?: string
}

export default class ElasticsearchAdapter {
  username: string
  password: string
  host: string
  authHeader?: string

  constructor (elasticsearch: ElasticsearchConfig) {
    this.username = elasticsearch.username
    this.password = elasticsearch.password
    this.host = addTrailingSlash(elasticsearch.uri)

    if (this.username.length > 0 || this.password.length > 0) {
      this.authHeader = buildFetchAuthHeader(this.username, this.password)
    }
  }

  ping () {
    return this.request('', 'GET')
  }

  clusterInfo () {
    return this.ping()
  }

  clusterHealth () {
    return this.request('_cluster/health', 'GET')
  }

  clusterStats () {
    return this.request('_cluster/stats', 'GET')
  }

  clusterSettings () {
    return this.request('_cluster/settings', 'GET', { include_defaults: true })
  }

  clusterReroute (commands: object) {
    return this.request('_cluster/reroute', 'POST', { commands })
  }

  catIndices (params: object, filter?: string) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/indices/${query}`, 'GET', params)
  }

  catIndexTemplates (params: object, filter?: string) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_index_template/${query}`, 'GET', params)
  }

  catShards (params: object, filter?: string) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/shards/${query}`, 'GET', params)
  }

  indexGetAlias ({ index }: { index: string }) {
    return this.request(`${index}/_alias`, 'GET')
  }

  indexAddAlias ({ index, alias }: { index: string, alias: string }) {
    return this.request(`${index}/_alias/${alias}`, 'PUT')
  }

  indexDeleteAlias ({ index, alias }: { index: string, alias: string }) {
    return this.request(`${index}/_alias/${alias}`, 'DELETE')
  }

  indexCreate ({ index, body }: { index: string, body?: object }) {
    return this.request(`${index}`, 'PUT', body)
  }

  indexDelete ({ index }: { index: string }) {
    return this.request(`${index}`, 'DELETE')
  }

  indexGet (params: Record<string, any>) {
    const index = Array.isArray(params.index) ? params.index.join(',') : params.index
    return this.request(`${index}`, 'GET')
  }

  indexStats ({ index }: { index: string }) {
    return this.request(`${index}/_stats`, 'GET')
  }

  indexClose ({ index }: { index: string }) {
    return this.request(`${index}/_close`, 'POST')
  }

  indexOpen ({ index }: { index: string }) {
    return this.request(`${index}/_open`, 'POST')
  }

  indexForcemerge ({ index }: { index: string }) {
    return this.request(`${index}/_forcemerge`, 'POST')
  }

  indexRefresh ({ index }: { index: string }) {
    return this.request(`${index}/_refresh`, 'POST')
  }

  indexClearCache ({ index }: { index: string }) {
    return this.request(`${index}/_cache/clear`, 'POST')
  }

  indexFlush ({ index }: { index: string }) {
    return this.request(`${index}/_flush`, 'POST')
  }

  indexExists ({ index }: { index: string }) {
    return this.request(`${index}`, 'HEAD')
  }

  indexPutSettings ({ index, body }: { index: string, body: object }) {
    return this.request(`${index}/_settings`, 'PUT', body)
  }

  catNodes (params: object) {
    return this.request('_cat/nodes', 'GET', params)
  }

  nodes () {
    return this.request('_nodes', 'GET')
  }


  get ({ index, type, id, routing }: { index: string, type: string, id: any, routing: any }) {
    const docType = type || '_doc'
    const params: IndexGetArgs = {}
    if (routing) params.routing = routing
    return this.request(`${index}/${docType}/${encodeURIComponent(id)}`, 'GET', params)
  }

  search (params: object, searchIndex?: string | string[]) {
    const index = Array.isArray(searchIndex) ? searchIndex.join(',') : searchIndex

    if (index && index.length > 0) {
      return this.request(`${index}/_search`, 'POST', params)
    } else {
      return this.request('_search', 'POST', params)
    }
  }

  catRepositories (params: object) {
    return this.request('_snapshot', 'GET', params)
  }

  catSnapshots ({ repository }: { repository: string }) {
    return this.request(`_cat/snapshots/${repository}`, 'GET')
  }

  snapshotCreateRepository ({ repository, body }: { repository: string, body: object }) {
    return this.request(`_snapshot/${repository}`, 'PUT', body)
  }

  snapshotDeleteRepository ({ repository }: { repository: string }) {
    return this.request(`_snapshot/${repository}`, 'DELETE')
  }

  snapshotCreate ({ repository, snapshot, body }: { repository: string, snapshot: string, body: object }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'PUT', body)
  }

  snapshotDelete ({ repository, snapshot }: { repository: string, snapshot: string }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'DELETE')
  }

  snapshotRestore ({ repository, snapshot, body }: { repository: string, snapshot: string, body: object }) {
    return this.request(`_snapshot/${repository}/${snapshot}/_restore`, 'POST', body)
  }

  getSnapshot ({ repository, snapshot }: { repository: string, snapshot: string }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'GET')
  }

  /*
  bulk ({ body }: { body: object[] }) {
    const data = body.map(d => JSON.stringify(d)).join('\n') + '\n'
    return this.request('_bulk', 'POST', data)
  }
   */

  request (path: string, method: string, params?: Record<string, any>) {
    const url = new URL(this.host + path)

    if (method === 'GET' && typeof params === 'object') {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    }

    let body = null
    if (method === 'PUT' || method === 'POST') body = params

    const options: RequestInit = {
      method,
      body: body && typeof body !== 'string' ? JSON.stringify(body) : body,
      headers: Object.assign({}, REQUEST_DEFAULT_HEADERS)
    }

    // @ts-ignore
    if (this.authHeader) options.headers['Authorization'] = this.authHeader

    return new Promise((resolve, reject) => {
      return fetchMethod(url, options)
          .then(response => {
            if (options.method === 'HEAD') {
              return resolve(response.ok)
            }

            if (response.ok) {
              resolve(response)
            } else {
              reject(response)
            }
          }).catch(reject)
    })
  }

  async test () {
    try {
      const info = await this.ping()
      await this.search({ size: 0 })
      return Promise.resolve(info)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /********/

  /**
   * Creates multiple indices, one for each word. Only creates if they do not already exist
   * @param names {Array}
   */
  async createIndices (names: string[]) {
    for (const name of [...new Set(names)]) {
      const exists = await this.indexExists({ index: name })
      if (!exists) await this.indexCreate({ index: name })
    }
  }
}
