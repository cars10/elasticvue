import { addTrailingSlash, buildFetchAuthHeader } from '../helpers/elasticsearchAdapter.ts'
import { REQUEST_DEFAULT_HEADERS } from '../consts'
import { fetchMethod } from '../helpers/fetch'
import { stringifyJson } from '../helpers/json/stringify.ts'
import { ElasticsearchClusterCredentials } from '../store/connection.ts'
import { cleanIndexName } from '../helpers/cleanIndexName.ts'
import { AwsClient } from 'aws4fetch'

interface IndexGetArgs {
  routing?: string
}

export type ElasticsearchMethod = keyof ElasticsearchAdapter
const MAX_INDICES_PER_REQUEST = 16

const chunk = (array: any[], size: number) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size))
}

export default class ElasticsearchAdapter {
  username?: string
  password?: string
  uri: string
  authHeader?: string
  authType?: 'basic' | 'api' | 'aws-iam' | ''
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
  region?: string
  awsClient?: AwsClient

  constructor ({ uri, username, password, authType, accessKeyId, secretAccessKey, sessionToken, region }: ElasticsearchClusterCredentials) {
    this.username = username
    this.password = password
    this.uri = addTrailingSlash(uri)
    this.authType = authType
    this.accessKeyId = accessKeyId
    this.secretAccessKey = secretAccessKey
    this.sessionToken = sessionToken
    this.region = region

    if (this.authType === 'aws-iam') {
      this.awsClient = new AwsClient({
        accessKeyId: this.accessKeyId || '',
        secretAccessKey: this.secretAccessKey || '',
        sessionToken: this.sessionToken || undefined,
        service: 'es',
        region: this.region || 'us-east-1',
      })
    } else if (this.username.length > 0 || this.password.length > 0) {
      this.authHeader = buildFetchAuthHeader(this.username, this.password)
    }
  }

  call (method: ElasticsearchMethod, ...args: any[]): Promise<any> {
    // @ts-expect-error dynamic function call
    return this[method](...args)
  }

  async callInChunks ({ method, indices }: { method: keyof ElasticsearchAdapter, indices: string[] }) {
    const chunks = chunk(indices, MAX_INDICES_PER_REQUEST)
    const responses = []

    for (const c of chunks) {
      const response = await this.call(method, { indices: c })
      responses.push(response)
    }

    return responses
  }

  /** routes always available **/

  ping () {
    return this.request('', 'GET')
  }

  clusterInfo () {
    return this.ping()
  }

  catIndices (params: object, filter?: string) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/indices/${query}`, 'GET', params)
  }

  template () {
    return this.request('_template', 'GET')
  }

  indexTemplate () {
    return this.request('_index_template', 'GET')
  }

  indexGetAlias ({ index }: { index: string }) {
    return this.request(`${cleanIndexName(index)}/_alias`, 'GET')
  }

  indexAddAlias ({ index, alias }: { index: string, alias: string }) {
    return this.request(`${cleanIndexName(index)}/_alias/${alias}`, 'PUT')
  }

  indexDeleteAlias ({ index, alias }: { index: string, alias: string }) {
    return this.request(`${cleanIndexName(index)}/_alias/${alias}`, 'DELETE')
  }

  indexCreate ({ index, body }: { index: string, body?: object }) {
    return this.request(`${cleanIndexName(index)}`, 'PUT', body)
  }

  deleteByQuery ({ index }: { index: string }) {
    const body = { query: { match_all: {} } }
    return this.request(`${cleanIndexName(index)}/_delete_by_query?refresh=true`, 'POST', body)
  }

  indexGet (params: Record<string, any>) {
    const index = Array.isArray(params.index) ? params.index.join(',') : params.index
    return this.request(`${cleanIndexName(index)}`, 'GET')
  }

  indexStats ({ index }: { index: string }) {
    return this.request(`${cleanIndexName(index)}/_stats`, 'GET')
  }

  indexDelete ({ indices }: { indices: string[] }) {
    if (indices.length > MAX_INDICES_PER_REQUEST) {
      return this.callInChunks({ method: 'indexDelete', indices })
    } else {
      return this.request(cleanIndexName(indices.join(',')), 'DELETE')
    }
  }

  indexRefresh ({ indices }: { indices: string[] }) {
    if (indices.length > MAX_INDICES_PER_REQUEST) {
      return this.callInChunks({ method: 'indexRefresh', indices })
    } else {
      return this.request(`${cleanIndexName(indices.join(','))}/_refresh`, 'POST')
    }
  }

  indexClearCache ({ indices }: { indices: string[] }) {
    if (indices.length > MAX_INDICES_PER_REQUEST) {
      return this.callInChunks({ method: 'indexClearCache', indices })
    } else {
      return this.request(`${cleanIndexName(indices.join(','))}/_cache/clear`, 'POST')
    }
  }

  indexFlush ({ indices }: { indices: string[] }) {
    if (indices.length > MAX_INDICES_PER_REQUEST) {
      return this.callInChunks({ method: 'indexFlush', indices })
    } else {
      return this.request(`${cleanIndexName(indices.join(','))}/_flush`, 'POST')
    }
  }

  indexExists ({ index }: { index: string }) {
    return this.request(`${cleanIndexName(index)}`, 'HEAD')
  }

  indexPutSettings ({ index, body }: { index: string, body: object }) {
    return this.request(`${cleanIndexName(index)}/_settings`, 'PUT', body)
  }

  reindex ({ source, dest }: { source: string, dest: string }) {
    return this.request('_reindex?wait_for_completion=false', 'POST', {
      source: { index: source },
      dest: { index: dest }
    })
  }

  index ({ index, type, id, routing, params }: {
    index: string,
    type: string,
    id: any,
    routing: string,
    params: any
  }) {
    let path = `${cleanIndexName(index)}/${type}/${encodeURIComponent(id)}?refresh=true`
    if (routing) path += `&routing=${routing}`
    return this.request(path, 'PUT', params)
  }

  get ({ index, type, id, routing }: { index: string, type: string, id: any, routing?: string }) {
    const params: IndexGetArgs = {}
    if (routing) params.routing = routing
    return this.request(`${cleanIndexName(index)}/${type}/${encodeURIComponent(id)}`, 'GET', params)
  }

  delete ({ index, type, id, routing }: { index: string, type: string, id: any, routing?: string }) {
    let path = `${cleanIndexName(index)}/${type}/${encodeURIComponent(id)}?refresh=true`
    if (routing) path += `&routing=${routing}`
    return this.request(path, 'DELETE')
  }

  search (params: object, searchIndex?: string | string[]) {
    const index = Array.isArray(searchIndex) ? searchIndex.join(',') : searchIndex

    if (index && index.length > 0) {
      return this.request(`${cleanIndexName(index)}/_search`, 'POST', params)
    } else {
      return this.request('_search', 'POST', params)
    }
  }

  docsBulkDelete (documents: any[]) {
    const body = documents.map(str => {
      const matches = str.split(/####(.*)####(.*)/)
      return JSON.stringify({ delete: { _index: matches[0], _id: matches[2] } })
    }).join('\r\n') + '\r\n'
    return this.request('_bulk?refresh=true', 'POST', body)
  }

  /** routes only available in default elasticsearch, but not in serverless **/

  clusterHealth () {
    return this.request('_cluster/health', 'GET')
  }

  clusterStats () {
    return this.request('_cluster/stats', 'GET')
  }

  clusterReroute (commands: object) {
    return this.request('_cluster/reroute', 'POST', { commands })
  }

  catShards (params: object, filter?: string) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/shards/${query}`, 'GET', params)
  }

  catRecovery () {
    return this.request('_cat/recovery?s=start_time_millis:desc', 'GET')
  }

  recovery () {
    return this.request('_recovery', 'GET')
  }

  indexClose ({ indices }: { indices: string[] }) {
    if (indices.length > MAX_INDICES_PER_REQUEST) {
      return this.callInChunks({ method: 'indexClose', indices })
    } else {
      return this.request(`${cleanIndexName(indices.join(','))}/_close`, 'POST')
    }
  }

  indexOpen ({ indices }: { indices: string[] }) {
    if (indices.length > MAX_INDICES_PER_REQUEST) {
      return this.callInChunks({ method: 'indexOpen', indices })
    } else {
      return this.request(`${cleanIndexName(indices.join(','))}/_open`, 'POST')
    }
  }

  indexForcemerge ({ indices }: { indices: string[] }) {
    if (indices.length > MAX_INDICES_PER_REQUEST) {
      return this.callInChunks({ method: 'indexForcemerge', indices })
    } else {
      return this.request(`${cleanIndexName(indices.join(','))}/_forcemerge`, 'POST')
    }
  }

  catNodes (params: object) {
    return this.request('_cat/nodes', 'GET', params)
  }

  nodes () {
    return this.request('_nodes', 'GET')
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

    if (this.authHeader) (options.headers as Record<string, string>)['Authorization'] = this.authHeader

    if (this.authType === 'aws-iam' && this.awsClient) {
      delete (options.headers as Record<string, string>)['Authorization']
      return (async () => {
        const signed = await this.awsClient?.sign(url.toString(), options)
        signed?.headers.forEach((value, key) => {
          (options.headers as Record<string, string>)[key] = value
        })
        return fetchMethod(url, options)
      })()
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

  async test () {
    try {
      const info = await this.ping()
      await this.search({ size: 0 })
      return Promise.resolve(info)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
