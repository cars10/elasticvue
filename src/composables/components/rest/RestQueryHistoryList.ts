import { useIdbStore } from '../../../db/Idb.ts'
import { IdbRestQueryHistory } from '../../../db/types.ts'
import { useTranslation } from '../../i18n.ts'

export const useRestQueryHistoryList = (emit: any) => {
  const { restQueryHistory, restQuerySavedQueries } = useIdbStore()
  const t = useTranslation()

  const saveHistory = (row: IdbRestQueryHistory) => {
    const { method, path, body } = row
    restQuerySavedQueries.insert({ method, path, body })
    emit('reloadSavedQueries')
  }
  const removeHistory = async (id: number) => {
    await restQueryHistory.remove(id)
    emit('reloadHistory')
  }

  const columns = [
    { label: t('query.rest_query_history.table.headers.query'), field: 'query', name: 'query', align: 'left' },
    {
      label: t('query.rest_query_history.table.headers.timestamp'), field: 'date', name: 'date', align: 'left',
      sortOrder: 'da', sortableCol: true
    },
    { label: '' }
  ]

  return {
    saveHistory,
    removeHistory,
    columns
  }
}
