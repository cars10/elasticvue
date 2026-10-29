import { ref, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { sqlBody, sqlPage, type SqlApi, type SqlMode } from '../../../helpers/search/sql.ts'

export const useSqlSearch = () => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const columns = shallowRef<string[]>([])
  const rows = shallowRef<unknown[][]>([])
  const cursor = ref<string | null>(null)
  let current: { api: SqlApi; mode: SqlMode } | null = null
  let latest = 0

  const fetchPage = ({ path, format }: SqlApi, body: object) =>
    callElasticsearch('sqlQuery', { path, format, body }).then(sqlPage)

  const run = async (api: SqlApi, mode: SqlMode, query: string) => {
    const request = ++latest
    current = { api, mode }
    try {
      const page = await fetchPage(api, sqlBody(api, mode, query))
      if (request !== latest) return
      columns.value = page.columns ?? []
      rows.value = page.rows
      cursor.value = page.cursor
    } catch (_e) {
      if (request !== latest) return
      columns.value = []
      rows.value = []
      cursor.value = null
    }
  }

  const loadMore = async () => {
    if (!cursor.value || !current) return
    const request = latest
    const page = await fetchPage(current.api, sqlBody(current.api, current.mode, '', cursor.value)).catch(() => null)
    if (!page || request !== latest) return
    rows.value = [...rows.value, ...page.rows]
    cursor.value = page.cursor
  }

  return { requestState, columns, rows, cursor, run, loadMore }
}
