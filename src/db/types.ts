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
}

export type IdbRestQueryTab = {
  id?: number
  label: string
  name: string
  request: IdbRestQueryTabRequest
}

export type IdbRestQueryTabRequest = {
  method: string
  path: string
  body: string
}

export interface DbSchema {
  restQueryHistory: DbModel<IdbRestQueryHistory>,
  restQuerySavedQueries: DbModel<IdbRestQuerySavedQuery>
  restQueryTabs: DbModel<IdbRestQueryTab>
}
