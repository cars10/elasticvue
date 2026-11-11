import type { SqlApi } from '../capabilities.ts'

export type { SqlApi }

export type SqlMode = 'sql' | 'esql'
export type SqlPage = { columns: string[] | null; rows: unknown[][]; cursor: string | null }

type SqlColumn = { name: string; alias?: string }
type SqlResponse = {
  columns?: SqlColumn[]
  rows?: unknown[][]
  values?: unknown[][]
  schema?: SqlColumn[]
  datarows?: unknown[][]
  cursor?: string
}

export const SQL_FETCH_SIZE = 100

export const sqlBody = (api: SqlApi, mode: SqlMode, query: string, cursor?: string | null) => {
  if (cursor) return { cursor }
  return mode === 'esql' ? { query } : { query, fetch_size: SQL_FETCH_SIZE, ...api.params }
}

export const sqlPage = (response: SqlResponse): SqlPage => {
  const columns = response.columns ?? response.schema
  return {
    columns: columns ? columns.map((column) => column.alias || column.name) : null,
    rows: response.rows ?? response.values ?? response.datarows ?? [],
    cursor: response.cursor || null
  }
}

export const defaultSqlQuery = (mode: SqlMode, targets: string[], isElasticsearch = true) => {
  const from = mode === 'esql' || !isElasticsearch ? targets.join(',') : `"${targets.join(',')}"`
  return mode === 'esql' ? `FROM ${from}\n| LIMIT 100` : `SELECT *\nFROM ${from}\nLIMIT 100`
}
