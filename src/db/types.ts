import { DbModel } from './indexeddb.ts'

export type TableDefinition = {
  name: string
  indexes: string[]
}

export type IdbRestQueryHistory = {
  id?: number
  method: string
  path: string
  body: string
  date: Date
}

export type IdbRestQuerySavedQuery = {
  id?: number
  method: string
  path: string
  body: string
  favorite?: 1 | 0
}

export type IdbRestQueryTab = {
  id?: number
  label: string
  name: string
  request: IdbRestQueryTabRequest
  response: IdbRestQueryTabResponse
}

export type IdbRestQueryTabRequest = {
  method: string
  path: string
  body: string
}

export type IdbRestQueryTabResponse = {
  status: string
  ok: boolean
  bodyText: string
}

export interface DbSchema {
  restQueryHistory: DbModel<IdbRestQueryHistory>,
  restQuerySavedQueries: DbModel<IdbRestQuerySavedQuery>
  restQueryTabs: DbModel<IdbRestQueryTab>
}
