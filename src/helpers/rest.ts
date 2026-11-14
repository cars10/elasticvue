import type {
  IdbRestQueryHistory,
  IdbRestQueryResponse,
  IdbRestQuerySavedQuery,
  IdbRestQueryTab,
  IdbRestQueryTabRequest,
  IdbRestQueryTabResponse
} from '../db/types.ts'
import { formatTimeAgo } from './time.ts'
import { cleanIndexName } from './cleanIndexName.ts'
import { matchesAllTerms } from './filters.ts'

export const HISTORY_LIMIT = 1000
export const HISTORY_MAX_BODY_LENGTH = 100_000
export const SEARCHABLE_BODY_LENGTH = 1_000

export const hasNoBody = (method: string) => ['GET', 'HEAD'].includes(method)

export const emptyResponse = (): IdbRestQueryTabResponse => ({ status: '', ok: false, bodyText: '' })

export type RestTab = Required<IdbRestQueryTab>

const defaultRequest = (): IdbRestQueryTabRequest => ({ method: 'POST', path: '', body: '' })

export const buildTab = (label: string, request?: IdbRestQueryTabRequest): IdbRestQueryTab => ({
  label,
  request: pickRequest(request ?? defaultRequest())
})

export const normalizeTab = (tab: IdbRestQueryTab, index: number, response?: IdbRestQueryResponse): RestTab => ({
  id: tab.id!,
  label: tab.label || `Tab ${index + 1}`,
  request: pickRequest({ ...defaultRequest(), ...tab.request }),
  response: pickResponse({ ...emptyResponse(), ...(response ?? tab.response) })
})

export const pickRequest = ({ method, path, body }: IdbRestQueryTabRequest): IdbRestQueryTabRequest => ({
  method,
  path,
  body
})

const pickResponse = ({ status, ok, bodyText, duration }: IdbRestQueryTabResponse): IdbRestQueryTabResponse => ({
  status,
  ok,
  bodyText,
  duration
})

export const sameRequest = (a?: IdbRestQueryTabRequest, b?: IdbRestQueryTabRequest) =>
  !!a && !!b && a.method === b.method && a.path === b.path && a.body === b.body

export const historyEntry = (request: IdbRestQueryTabRequest): IdbRestQueryHistory => {
  const { method, path, body } = request
  const storeBody = !hasNoBody(method) && body.length <= HISTORY_MAX_BODY_LENGTH
  return { method, path, body: storeBody ? body : '', date: new Date() }
}

export const savedQueryName = (query: IdbRestQuerySavedQuery) => query.name || `${query.method} ${query.path}`

export const responseStatusColor = (status: string) => {
  if (status.startsWith('2')) return 'positive'
  if (status.startsWith('3') || status.startsWith('4')) return 'warning'
  if (status.startsWith('5')) return 'negative'
  return 'grey'
}

export const restRequestUrl = (uri: string, path: string) => {
  const separator = uri.endsWith('/') || path.startsWith('/') ? '' : '/'
  return `${uri}${separator}${cleanIndexName(path)}`
}

export const curlCommand = (method: string, url: string, body = '') => {
  const data = body.trim() ? ` -H 'Content-Type: application/json' -d '${body.replace(/'/g, String.raw`'\''`)}'` : ''
  return `curl -X ${method} '${url}'${data}`
}

export const restDocsUrl = (distributionIsElasticsearch: boolean, version?: string) => {
  if (!distributionIsElasticsearch) return 'https://docs.opensearch.org/latest/api-reference/'
  if (parseInt(version || '0') >= 9) return 'https://www.elastic.co/docs/api/doc/elasticsearch'

  const minor = version?.split('.').slice(0, 2).join('.') || 'current'
  return `https://www.elastic.co/guide/en/elasticsearch/reference/${minor}/index.html`
}

export const compactBody = (body: string) => body.slice(0, 200).replace(/\s+/g, ' ')

export type RestPathSuggestion = IdbRestQueryTabRequest & {
  key: string
  source: 'saved' | 'history'
  caption: string
}

export type RestSuggestionIndex = { suggestion: RestPathSuggestion; text: string; date?: Date }[]

export const indexSuggestions = (history: IdbRestQueryHistory[], saved: IdbRestQuerySavedQuery[]): RestSuggestionIndex => {
  const seen = new Set<string>()
  const index: RestSuggestionIndex = []

  const add = (item: IdbRestQueryTabRequest, source: RestPathSuggestion['source'], name: string, date?: Date) => {
    const id = `${item.method} ${item.path}\n${item.body}`
    if (seen.has(id)) return

    seen.add(id)
    const { method, path, body } = item
    index.push({
      suggestion: { method, path, body, key: `${source}-${index.length}`, source, caption: name },
      text: `${method} ${path}\n${body.slice(0, SEARCHABLE_BODY_LENGTH)}\n${name}`.toLowerCase(),
      date
    })
  }

  saved.forEach((s) => add(s, 'saved', savedQueryName(s)))
  history
    .slice()
    .reverse()
    .forEach((h) => add(h, 'history', '', h.date ? new Date(h.date) : undefined))

  return index
}

export const filterSuggestions = (index: RestSuggestionIndex, query: string, limit = 8): RestPathSuggestion[] => {
  const results: RestPathSuggestion[] = []

  for (const { suggestion, text, date } of index) {
    if (!matchesAllTerms(text, query)) continue

    results.push(date ? { ...suggestion, caption: formatTimeAgo(date.getTime()) } : suggestion)
    if (results.length >= limit) break
  }

  return results
}
