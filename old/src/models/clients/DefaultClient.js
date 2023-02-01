import { buildFetchAuthHeader } from '@/helpers'
import { REQUEST_DEFAULT_HEADERS } from '@/consts'
import { stringifyJsonBigInt } from '@/helpers/json_parse'
import { fetchMethod } from '@/services/tauri/fetchReqwest'

export class DefaultClient {
  constructor (instance) {
    this.username = instance.username
    this.password = instance.password
    this.host = instance.uri[instance.uri.length - 1] === '/' ? instance.uri : instance.uri + '/'
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

  clusterSettings () {
    return this.request('_cluster/settings', 'GET', { include_defaults: true })
  }

  clusterReroute (commands) {
    return this.request('_cluster/reroute', 'POST', { commands })
  }

  catIndices (params, filter) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/indices/${query}`, 'GET', params)
  }

  catIndexTemplates (params, filter) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_index_template/${query}`, 'GET', params)
  }

  catShards (params, filter) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/shards/${query}`, 'GET', params)
  }

  indexGetAlias ({ index }) {
    return this.request(`${index}/_alias`, 'GET')
  }

  indexAddAlias ({ index, alias }) {
    return this.request(`${index}/_alias/${alias}`, 'PUT')
  }

  indexDeleteAlias ({ index, alias }) {
    return this.request(`${index}/_alias/${alias}`, 'DELETE')
  }

  indexCreate ({ index, body }) {
    return this.request(`${index}`, 'PUT', body)
  }

  indexDelete ({ index }) {
    return this.request(`${index}`, 'DELETE')
  }

  indexGet (params) {
    const index = Array.isArray(params.index) ? params.index.join(',') : params.index
    return this.request(`${index}`, 'GET')
  }

  indexStats ({ index }) {
    return this.request(`${index}/_stats`, 'GET')
  }

  indexClose ({ index }) {
    return this.request(`${index}/_close`, 'POST')
  }

  indexOpen ({ index }) {
    return this.request(`${index}/_open`, 'POST')
  }

  indexForcemerge ({ index }) {
    return this.request(`${index}/_forcemerge`, 'POST')
  }

  indexRefresh ({ index }) {
    return this.request(`${index}/_refresh`, 'POST')
  }

  indexClearCache ({ index }) {
    return this.request(`${index}/_cache/clear`, 'POST')
  }

  indexFlush ({ index }) {
    return this.request(`${index}/_flush`, 'POST')
  }

  indexExists ({ index }) {
    return this.request(`${index}`, 'HEAD')
  }

  indexPutSettings ({ index, body }) {
    return this.request(`${index}/_settings`, 'PUT', body)
  }

  catNodes (params) {
    return this.request('_cat/nodes', 'GET', params)
  }

  nodes () {
    return this.request('_nodes', 'GET')
  }

  get ({ index, type, id, routing }) {
    const docType = type || '_doc'
    const params = {}
    if (routing) {
      params.routing = routing
    }
    return this.request(`${index}/${docType}/${encodeURIComponent(id)}`, 'GET', params)
  }

  search (params, searchIndex) {
    const index = Array.isArray(searchIndex) ? searchIndex.join(',') : searchIndex

    if (index && index.length > 0) {
      return this.request(`${index}/_search`, 'POST', params)
    } else {
      return this.request('_search', 'POST', params)
    }
  }

  catRepositories (params) {
    return this.request('_snapshot', 'GET', params)
  }

  catSnapshots ({ repository }) {
    return this.request(`_cat/snapshots/${repository}`, 'GET')
  }

  snapshotCreateRepository ({ repository, body }) {
    return this.request(`_snapshot/${repository}`, 'PUT', body)
  }

  snapshotDeleteRepository ({ repository }) {
    return this.request(`_snapshot/${repository}`, 'DELETE')
  }

  snapshotCreate ({ repository, snapshot, body }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'PUT', body)
  }

  snapshotDelete ({ repository, snapshot }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'DELETE')
  }

  snapshotRestore ({ repository, snapshot, body }) {
    return this.request(`_snapshot/${repository}/${snapshot}/_restore`, 'POST', body)
  }

  getSnapshot ({ repository, snapshot }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'GET')
  }

  bulk ({ body }) {
    const data = body.map(d => stringifyJsonBigInt(d)).join('\n') + '\n'
    return this.request('_bulk', 'POST', data)
  }

  request (path, method, params) {
    const url = new URL(this.host + path)

    if (method === 'GET' && typeof params === 'object') {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    }

    let body = null
    if (method === 'PUT' || method === 'POST') body = params

    const options = {
      method,
      body: body && typeof body !== 'string' ? stringifyJsonBigInt(body) : body,
      headers: Object.assign({}, REQUEST_DEFAULT_HEADERS)
    }

    if (this.username.length > 0 || this.password.length > 0) {
      options.headers.Authorization = buildFetchAuthHeader(this.username, this.password)
    }

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
}
