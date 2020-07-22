import { buildFetchAuthHeaderFromUrl, urlWithoutCredentials } from '../../helpers'
import { REQUEST_DEFAULT_HEADERS } from '@/consts'

export class DefaultClient {
  constructor (host) {
    this.host = host || 'http://localhost:9200'
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

  catIndices (params) {
    return this.request('_cat/indices', 'GET', params)
  }

  indexGetAlias ({ index }) {
    return this.request(`${index}/_alias`, 'GET')
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

  get ({ index, type, id }) {
    const docType = type || '_doc'
    return this.request(`${index}/${docType}/${encodeURIComponent(id)}`, 'GET')
  }

  search (params) {
    let index = Array.isArray(params.index) ? params.index.join(',') : params.index
    delete params.index

    if (index.length > 0) {
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
    let data = body.map(d => JSON.stringify(d)).join('\n') + '\n'
    return this.request('_bulk', 'POST', data)
  }

  request (path, method, params) {
    let url = new URL(urlWithoutCredentials(this.host) + path)

    if (method === 'GET' && typeof params === 'object') {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    }

    let body = null
    if (method === 'PUT' || method === 'POST') body = params

    let options = {
      method,
      body: body && typeof body !== 'string' ? JSON.stringify(body) : body,
      headers: Object.assign({}, REQUEST_DEFAULT_HEADERS, buildFetchAuthHeaderFromUrl(this.host))
    }

    return new Promise((resolve, reject) => {
      return fetch(url, options)
        .then(response => {
          if (options.method === 'HEAD') {
            return resolve(response.ok)
          }

          if (response.ok) {
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('application/json')) {
              resolve(response.json())
            } else {
              resolve(true)
            }
          } else {
            reject(response)
          }
        }).catch(reject)
    })
  }
}
