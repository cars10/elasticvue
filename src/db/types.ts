import { DbTable } from './indexeddb.ts'

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

export type DbSchema = {
  restQueryHistory: DbTable<IdbRestQueryHistory>
  restQuerySavedQueries: DbTable<IdbRestQuerySavedQuery>
  restQueryTabs: DbTable<IdbRestQueryTab>
  restQueryResponses: DbTable<IdbRestQueryResponse>
}
