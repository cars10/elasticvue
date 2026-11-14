import { addTrailingSlash, clusterAuthHeader } from '../helpers/elasticsearchAdapter.ts'
import { REQUEST_DEFAULT_HEADERS } from '../consts'
import { fetchMethod, FetchResponse } from '../helpers/fetch'
import { stringifyJson } from '../helpers/json/stringify.ts'
import { cleanIndexName } from '../helpers/cleanIndexName.ts'
import { AuthType, ElasticsearchClusterConnection } from '../store/connection.ts'
import { AwsClient } from 'aws4fetch'
import { securityBasePath } from '../helpers/capabilities.ts'
import { elasticsearchCompatibleVersion, isSupportedDistribution, parseClusterInfo } from '../helpers/clusterInfo.ts'
import { parseJson } from '../helpers/json/parse.ts'
import { EsAbortError, EsApiError, EsNetworkError, isAbortError } from './errors.ts'

interface IndexGetArgs {
  routing?: string
}

export type RequestOptions = { signal?: AbortSignal }

export type ElasticsearchRequest<T = any> = (es: ElasticsearchAdapter) => Promise<T>

const MAX_INDICES_PER_REQUEST = 16

type AdapterCluster = ElasticsearchClusterConnection & { version?: string; distribution?: string }

type TemplateParams = { name?: string; filter_path?: string }

const templatePath = (base: string, name?: string) => (name ? `${base}/${cleanIndexName(name)}` : base)

const chunk = (array: any[], size: number) => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) => array.slice(i * size, i * size + size))
}

export default class ElasticsearchAdapter {
  uri: string
  awsClient: AwsClient | null
  authHeader?: string
  cluster: AdapterCluster

  constructor(cluster: AdapterCluster) {
    const { uri, auth } = cluster
    this.cluster = cluster
    this.uri = addTrailingSlash(uri)

    if (auth.authType === AuthType.awsIAM) {
      this.awsClient = new AwsClient({
        accessKeyId: auth.authData.accessKeyId,
        secretAccessKey: auth.authData.secretAccessKey,
        sessionToken: auth.authData.sessionToken,
        region: auth.authData.region,
        service: 'es'
      })
    }

    this.authHeader = clusterAuthHeader(auth)
  }

  private securityPath(path: string) {
    return `${securityBasePath(elasticsearchCompatibleVersion(this.cluster))}/${path}`
  }

  private async inChunks(indices: string[], request: (indices: string) => Promise<unknown>) {
    if (indices.length <= MAX_INDICES_PER_REQUEST) return request(cleanIndexName(indices.join(',')))

    for (const c of chunk(indices, MAX_INDICES_PER_REQUEST)) await request(cleanIndexName(c.join(',')))
    return { acknowledged: true }
  }

  ping(options?: RequestOptions) {
    return this.request('', 'GET', undefined, options)
  }

  catIndices(params: object, filter?: string) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/indices/${query}`, 'GET', params)
  }

  catAliases(params?: object) {
    return this.request('_cat/aliases', 'GET', params)
  }

  template({ name, ...params }: TemplateParams = {}) {
    return this.request(templatePath('_template', name), 'GET', params)
  }

  indexTemplate({ name, ...params }: TemplateParams = {}) {
    return this.request(templatePath('_index_template', name), 'GET', params)
  }

  componentTemplate({ name, ...params }: TemplateParams = {}) {
    return this.request(templatePath('_component_template', name), 'GET', params)
  }

  indexGetAlias({ index }: { index: string }) {
    return this.request(`${cleanIndexName(index)}/_alias`, 'GET')
  }

  indexAddAlias({ index, alias }: { index: string; alias: string }) {
    return this.request(`${cleanIndexName(index)}/_alias/${alias}`, 'PUT')
  }

  indexDeleteAlias({ index, alias }: { index: string; alias: string }) {
    return this.request(`${cleanIndexName(index)}/_alias/${alias}`, 'DELETE')
  }

  indexCreate({ index, body }: { index: string; body?: object }) {
    return this.request(`${cleanIndexName(index)}`, 'PUT', body)
  }

  deleteByQuery({ index }: { index: string }) {
    const body = { query: { match_all: {} } }
    return this.request(`${cleanIndexName(index)}/_delete_by_query?refresh=true`, 'POST', body)
  }

  indexGet(params: Record<string, any>) {
    const index = Array.isArray(params.index) ? params.index.join(',') : params.index
    return this.request(`${cleanIndexName(index)}`, 'GET')
  }

  catIndicesFor({ index, params }: { index: string; params?: Record<string, string> }) {
    return this.request(`_cat/indices/${cleanIndexName(index)}`, 'GET', params)
  }

  fieldCaps({ index, params }: { index: string; params?: Record<string, string> }) {
    return this.request(`${cleanIndexName(index)}/_field_caps`, 'GET', { fields: '*', ...params })
  }

  indexMappings({ index }: { index: string }) {
    return this.request(`${cleanIndexName(index)}/_mapping`, 'GET')
  }

  resolveIndex({ name, params }: { name: string; params?: Record<string, string> }) {
    return this.request(`_resolve/index/${cleanIndexName(name)}`, 'GET', params)
  }

  indexStats({ index }: { index: string }) {
    return this.request(`${cleanIndexName(index)}/_stats`, 'GET')
  }

  indexDelete({ indices }: { indices: string[] }) {
    return this.inChunks(indices, (names) => this.request(names, 'DELETE'))
  }

  indexRefresh({ indices }: { indices: string[] }) {
    return this.inChunks(indices, (names) => this.request(`${names}/_refresh`, 'POST'))
  }

  indexClearCache({ indices }: { indices: string[] }) {
    return this.inChunks(indices, (names) => this.request(`${names}/_cache/clear`, 'POST'))
  }

  indexFlush({ indices }: { indices: string[] }) {
    return this.inChunks(indices, (names) => this.request(`${names}/_flush`, 'POST'))
  }

  indexGetSettings({ index }: { index: string }) {
    return this.request(`${cleanIndexName(index)}/_settings`, 'GET')
  }

  indexGetAllSettings(params?: object) {
    return this.request('_all/_settings', 'GET', params)
  }

  indexPutSettings({ indices, body }: { indices: string[]; body: object }) {
    return this.inChunks(indices, (names) => this.request(`${names}/_settings`, 'PUT', body))
  }

  reindex({ source, dest }: { source: string; dest: string }) {
    return this.request('_reindex?wait_for_completion=false', 'POST', {
      source: { index: source },
      dest: { index: dest }
    })
  }

  clone({ source, dest }: { source: string; dest: string }) {
    return this.request(`${cleanIndexName(source)}/_clone/${cleanIndexName(dest)}`, 'POST')
  }

  index({ index, type, id, routing, params }: { index: string; type: string; id: any; routing?: string; params: any }) {
    let path = `${cleanIndexName(index)}/${type}/${encodeURIComponent(id)}?refresh=true`
    if (routing) path += `&routing=${routing}`
    return this.request(path, 'PUT', params)
  }

  indexDocument({ index, type, id, params }: { index: string; type: string; id?: string; params: any }) {
    const path = `${cleanIndexName(index)}/${type}${id ? `/${encodeURIComponent(id)}` : ''}?refresh=true`
    return this.request(path, 'POST', params)
  }

  get({ index, type, id, routing }: { index: string; type: string; id: any; routing?: string }) {
    const params: IndexGetArgs = {}
    if (routing) params.routing = routing
    return this.request(`${cleanIndexName(index)}/${type}/${encodeURIComponent(id)}`, 'GET', params)
  }

  delete({ index, type, id, routing }: { index: string; type: string; id: any; routing?: string }) {
    let path = `${cleanIndexName(index)}/${type}/${encodeURIComponent(id)}?refresh=true`
    if (routing) path += `&routing=${routing}`
    return this.request(path, 'DELETE')
  }

  securityUsers(params?: object) {
    return this.request(this.securityPath('user'), 'GET', params)
  }

  securityRoles(params?: object) {
    return this.request(this.securityPath('role'), 'GET', params)
  }

  securityRoleMappings(params?: object) {
    return this.request(this.securityPath('role_mapping'), 'GET', params)
  }

  securityAuthenticate() {
    return this.request(this.securityPath('_authenticate'), 'GET')
  }

  securityRolePut({ name, body }: { name: string; body: object }) {
    return this.request(this.securityPath(`role/${encodeURIComponent(name)}`), 'PUT', body)
  }

  securityRoleDelete({ name }: { name: string }) {
    return this.request(this.securityPath(`role/${encodeURIComponent(name)}`), 'DELETE')
  }

  securityUserPut({ username, body }: { username: string; body: object }) {
    return this.request(this.securityPath(`user/${encodeURIComponent(username)}`), 'PUT', body)
  }

  securityUserPutPassword({ username, body }: { username: string; body: object }) {
    return this.request(this.securityPath(`user/${encodeURIComponent(username)}/_password`), 'PUT', body)
  }

  securityUserDelete({ username }: { username: string }) {
    return this.request(this.securityPath(`user/${encodeURIComponent(username)}`), 'DELETE')
  }

  search(params: object, searchIndex?: string | string[], queryParams?: Record<string, string>, options?: RequestOptions) {
    const index = Array.isArray(searchIndex) ? searchIndex.join(',') : searchIndex

    let path = index && index.length > 0 ? `${cleanIndexName(index)}/_search` : '_search'

    if (queryParams && Object.keys(queryParams).length > 0) {
      path += `?${new URLSearchParams(queryParams).toString()}`
    }

    return this.request(path, 'POST', params, options)
  }

  sqlQuery({ path, format, body }: { path: string; format: string; body: object }) {
    return this.request(`${path}?format=${format}`, 'POST', body)
  }

  docsBulkDelete(documents: any[]) {
    const body =
      documents
        .map((str) => {
          const matches = str.split(/####(.*)####(.*)/)
          return JSON.stringify({ delete: { _index: matches[0], _id: matches[2] } })
        })
        .join('\r\n') + '\r\n'
    return this.request('_bulk?refresh=true', 'POST', body)
  }

  clusterHealth(options?: RequestOptions) {
    return this.request('_cluster/health', 'GET', undefined, options)
  }

  clusterStats(params?: object, options?: RequestOptions) {
    return this.request('_cluster/stats', 'GET', params, options)
  }

  clusterPendingTasks() {
    return this.request('_cluster/pending_tasks', 'GET')
  }

  nodesStats(metrics?: string, params?: object, options?: RequestOptions) {
    const path = metrics ? `_nodes/stats/${metrics}` : '_nodes/stats'
    return this.request(path, 'GET', params, options)
  }

  clusterReroute(commands: object) {
    return this.request('_cluster/reroute', 'POST', { commands })
  }

  clusterRetryFailedAllocations() {
    return this.request('_cluster/reroute?retry_failed=true', 'POST')
  }

  clusterAllocationExplain({ body, includeDiskInfo }: { body: object; includeDiskInfo?: boolean }) {
    const query = includeDiskInfo === undefined ? '' : `?include_disk_info=${includeDiskInfo}`
    return this.request(`_cluster/allocation/explain${query}`, 'POST', body)
  }

  clusterGetSettings(params?: object) {
    return this.request('_cluster/settings', 'GET', params)
  }

  clusterState(metrics: string) {
    return this.request(`_cluster/state/${metrics}`, 'GET')
  }

  clusterPutSettings(body: object) {
    return this.request('_cluster/settings', 'PUT', body)
  }

  clusterGetVotingExclusions() {
    return this.request('_cluster/state/metadata?filter_path=metadata.cluster_coordination.voting_config_exclusions', 'GET')
  }

  clusterAddVotingExclusions({ nodeIds }: { nodeIds: string[] }) {
    return this.request(`_cluster/voting_config_exclusions?node_ids=${encodeURIComponent(nodeIds.join(','))}`, 'POST')
  }

  clusterClearVotingExclusions() {
    return this.request('_cluster/voting_config_exclusions?wait_for_removal=true', 'DELETE')
  }

  catShards(params: object, filter?: string) {
    const query = filter ? `${filter}*` : ''
    return this.request(`_cat/shards/${query}`, 'GET', params)
  }

  recovery(params?: object) {
    return this.request('_recovery', 'GET', params)
  }

  tasks(params?: object) {
    return this.request('_tasks', 'GET', params)
  }

  taskCancel({ taskId }: { taskId: string }) {
    return this.request(`_tasks/${encodeURIComponent(taskId)}/_cancel`, 'POST')
  }

  indexClose({ indices }: { indices: string[] }) {
    return this.inChunks(indices, (names) => this.request(`${names}/_close`, 'POST'))
  }

  indexOpen({ indices }: { indices: string[] }) {
    return this.inChunks(indices, (names) => this.request(`${names}/_open`, 'POST'))
  }

  indexForcemerge({ indices }: { indices: string[] }) {
    return this.inChunks(indices, (names) => this.request(`${names}/_forcemerge`, 'POST'))
  }

  catNodes(params: object) {
    return this.request('_cat/nodes', 'GET', params)
  }

  nodes(params?: object) {
    return this.request('_nodes', 'GET', params)
  }

  catAllocation(params: object) {
    return this.request('_cat/allocation', 'GET', params)
  }

  nodesInfo(metrics: string, params?: object) {
    return this.request(`_nodes/_all/${metrics}`, 'GET', params)
  }

  dataStreams() {
    return this.request('_data_stream', 'GET')
  }

  catRepositories(params?: object) {
    return this.request('_snapshot', 'GET', params)
  }

  catSnapshots({ repository }: { repository: string }, params?: object) {
    return this.request(`_snapshot/${repository}/_all`, 'GET', params)
  }

  snapshotCreateRepository({ repository, body }: { repository: string; body: object }) {
    return this.request(`_snapshot/${repository}`, 'PUT', body)
  }

  snapshotDeleteRepository({ repository }: { repository: string }) {
    return this.request(`_snapshot/${repository}`, 'DELETE')
  }

  snapshotVerifyRepository({ repository }: { repository: string }) {
    return this.request(`_snapshot/${repository}/_verify`, 'POST')
  }

  snapshotStatus({ repository }: { repository?: string } = {}, params?: object) {
    return this.request(repository ? `_snapshot/${repository}/_status` : '_snapshot/_status', 'GET', params)
  }

  snapshotCreate({ repository, snapshot, body }: { repository: string; snapshot: string; body: object }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'PUT', body)
  }

  snapshotDelete({ repository, snapshot }: { repository: string; snapshot: string }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'DELETE')
  }

  snapshotRestore({ repository, snapshot, body }: { repository: string; snapshot: string; body: object }) {
    return this.request(`_snapshot/${repository}/${snapshot}/_restore`, 'POST', body)
  }

  getSnapshot({ repository, snapshot }: { repository: string; snapshot: string }) {
    return this.request(`_snapshot/${repository}/${snapshot}`, 'GET')
  }

  catSlmPolicies(params?: object) {
    return this.request('_slm/policy', 'GET', params)
  }

  slmGetPolicy({ policy }: { policy: string }) {
    return this.request(`_slm/policy/${policy}`, 'GET')
  }

  slmPutPolicy({ policy, body }: { policy: string; body: object }) {
    return this.request(`_slm/policy/${policy}`, 'PUT', body)
  }

  slmDeletePolicy({ policy }: { policy: string }) {
    return this.request(`_slm/policy/${policy}`, 'DELETE')
  }

  slmExecutePolicy({ policy }: { policy: string }) {
    return this.request(`_slm/policy/${policy}/_execute`, 'POST')
  }

  async request<T = any>(path: string, method: string, params?: any, options?: RequestOptions): Promise<T> {
    const url = new URL(this.uri + path)

    if (method === 'GET' && typeof params === 'object') {
      Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))
    }

    let body = null
    if (method === 'PUT' || method === 'POST') body = params

    const response = await this.send(url, method, body && typeof body !== 'string' ? stringifyJson(body) : body, options)
    const text = await response.text()
    if (!response.ok) throw new EsApiError(response.status, response.statusText, parseErrorBody(text))

    return parseBody(text) as T
  }

  async send(url: URL, method: string, body: string | null, options?: RequestOptions): Promise<FetchResponse> {
    let headers: Record<string, string> = { ...REQUEST_DEFAULT_HEADERS }
    if (this.authHeader) {
      headers.Authorization = this.authHeader
    } else if (this.awsClient) {
      const signed = await this.awsClient.sign(url.toString(), { method, body, headers })
      headers = Object.fromEntries(signed.headers.entries())
    }

    try {
      return await fetchMethod(url, { method, body, headers, ...(options?.signal && { signal: options.signal }) })
    } catch (e) {
      if (isAbortError(e)) throw new EsAbortError()
      throw new EsNetworkError(e)
    }
  }

  async test() {
    const info = await this.ping()
    try {
      await this.search({}, 'no_indices_match_this_pattern*', { allow_no_indices: 'true', ignore_unavailable: 'true', size: '0' })
    } catch (e) {
      const apiError = e instanceof EsApiError && ![401, 403].includes(e.status)
      if (!apiError || isSupportedDistribution(parseClusterInfo(info).distribution)) throw e
    }
    return info
  }
}

const parseErrorBody = (text: string) => {
  try {
    return parseJson(text)
  } catch (_e) {
    return text
  }
}

const parseBody = (text: string) => {
  if (!text) return true
  try {
    return parseJson(text)
  } catch (_e) {
    return true
  }
}
