import { addTrailingSlash, buildFetchAuthHeader } from '../helpers/elasticsearchAdapter.ts'
import { REQUEST_DEFAULT_HEADERS } from '../consts'
import { fetchMethod } from '../helpers/fetch'
import { stringifyJson } from '../helpers/json/stringify.ts'
import { ElasticsearchClusterCredentials } from '../store/connection.ts'

interface IndexGetArgs {
  routing?: string
}

export type ElasticsearchMethod = keyof ElasticsearchAdapter

export default class ElasticsearchAdapter {
  username?: string
  password?: string
  uri: string
  authHeader?: string

  constructor ({ uri, username, password }: ElasticsearchClusterCredentials) {
    this.username = username
    this.password = password
    this.uri = addTrailingSlash(uri)

    if (this.username.length > 0 || this.password.length > 0) {
      this.authHeader = buildFetchAuthHeader(this.username, this.password)
    }
  }

  call (method: ElasticsearchMethod, ...args: any[]): Promise<any> {
    // @ts-ignore
    return this[method](...args)
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

  clusterReroute (commands: object) {
    return this.request('_cluster/reroute', 'POST', { commands })
  }

  catIndices (params: object, filter?: string) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/indices/${query}`, 'GET', params)
  }

  catIndexTemplates () {
    return this.request('_template', 'GET')
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

  deleteByQuery ({ index }: { index: string }) {
    const body = { query: { match_all: {} } }
    return this.request(`${index}/_delete_by_query?refresh=true`, 'POST', body)
  }

  indexGet (params: Record<string, any>) {
    const index = Array.isArray(params.index) ? params.index.join(',') : params.index
    return this.request(`${index}`, 'GET')
  }

  indexStats ({ index, params }: { index: string, params?: any }) {
    return this.request(`${index}/_stats`, 'GET', params)
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

  reindex ({ source, dest }: { source: string, dest: string }) {
    return this.request('_reindex?wait_for_completion=false', 'POST', {
      source: { index: source },
      dest: { index: dest }
    })
  }

  catNodes (params: object) {
    return this.request('_cat/nodes', 'GET', params)
  }

  nodes () {
    return this.request('_nodes', 'GET')
  }

  index ({ index, type, id, params }: { index: string, type: string, id: any, params: any }) {
    return this.request(`${index}/${type}/${encodeURIComponent(id)}?refresh=true`, 'PUT', params)
  }

  get ({ index, type, id, routing }: { index: string, type: string, id: any, routing: any }) {
    const params: IndexGetArgs = {}
    if (routing) params.routing = routing
    return this.request(`${index}/${type}/${encodeURIComponent(id)}`, 'GET', params)
  }

  delete ({ index, type, id }: { index: string, type: string, id: any }) {
    return this.request(`${index}/${type}/${encodeURIComponent(id)}?refresh=true`, 'DELETE')
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
    return this.request(`_snapshot/${repository}/_all`, 'GET')
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

  docsBulkDelete (documents: any[]) {
    const body = documents.map(str => {
      const matches = str.split(/####(.*)####(.*)/)
      return JSON.stringify({ delete: { _index: matches[0], _id: matches[2] } })
    }).join('\r\n') + '\r\n'
    return this.request('_bulk?refresh=true', 'POST', body)
  }

  instanceStats ({ params }: { params?: any }) {
    return this.request('/_stats', 'GET', params)
  }

  request (path: string, method: string, params?: any) {
    const url = new URL(this.uri + path)

    if (method === 'GET' && typeof params === 'object') {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    }

    let body = null
    if (method === 'PUT' || method === 'POST') body = params

    const options: RequestInit = {
      method,
      body: body && typeof body !== 'string' ? stringifyJson(body) : body,
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
