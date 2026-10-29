import { DbTable } from './indexeddb.ts'
import type { SearchFilter, SearchMode, SearchTimeBounds } from '../types/search.ts'

export type IdbRestQueryHistory = {
  id?: number
  method: string
  path: string
  body: string
  date: Date
}

export type IdbRestQuerySavedQuery = {
  id?: number
  name?: string
  method: string
  path: string
  body: string
}

export type IdbRestQueryTab = {
  id?: number
  label: string
  request: IdbRestQueryTabRequest
  response?: IdbRestQueryTabResponse
}

export type IdbRestQueryResponse = IdbRestQueryTabResponse & { id: number }

export type IdbRestQueryTabRequest = {
  method: string
  path: string
  body: string
}

export type IdbRestQueryTabResponse = {
  status: string
  ok: boolean
  bodyText: string
  duration?: number
}

export type IdbSearchEntry = {
  id?: number
  name?: string
  date: Date
  targets: string[]
  mode: SearchMode
  query: string
  filters: SearchFilter[]
  timeRange: SearchTimeBounds | null
  timeField?: string
  columns?: string[]
}

export type DbSchema = {
  restQueryHistory: DbTable<IdbRestQueryHistory>
  restQuerySavedQueries: DbTable<IdbRestQuerySavedQuery>
  restQueryTabs: DbTable<IdbRestQueryTab>
  restQueryResponses: DbTable<IdbRestQueryResponse>
  searchHistory: DbTable<IdbSearchEntry>
  savedSearches: DbTable<IdbSearchEntry>
}
