import { versionAtLeast } from '../minClusterVersion.ts'

export type SqlMode = 'sql' | 'esql'
export type SqlApi = { path: string; format: string; params?: Record<string, unknown> }
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

export const sqlApi = (mode: SqlMode, version: string, isElasticsearch: boolean): SqlApi | null => {
  if (mode === 'esql') return isElasticsearch && versionAtLeast(version, '8.11') ? { path: '_query', format: 'json' } : null
  if (!isElasticsearch) return { path: '_plugins/_sql', format: 'jdbc' }
  if (versionAtLeast(version, '7')) return { path: '_sql', format: 'json', params: { field_multi_value_leniency: true } }
  if (versionAtLeast(version, '6.3')) return { path: '_xpack/sql', format: 'json' }
  return null
}

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

export const defaultSqlQuery = (mode: SqlMode, targets: string[]) =>
  mode === 'esql' ? `FROM ${targets.join(',')}\n| LIMIT 100` : `SELECT *\nFROM "${targets.join(',')}"\nLIMIT 100`
