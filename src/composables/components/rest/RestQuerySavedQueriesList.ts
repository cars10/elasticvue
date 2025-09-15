import { useTranslation } from '../../i18n.ts'
import { useIdbStore } from '../../../db/Idb.ts'
import { toRaw } from 'vue'
import { IdbRestQuerySavedQuery } from '../../../db/types.ts'

export const useRestQuerySavedQueriesList = (emit: any) => {
  const t = useTranslation()

  const { restQuerySavedQueries } = useIdbStore()

  const removeSavedQuery = async (id: number) => {
    await restQuerySavedQueries.remove(id)
    emit('reloadSavedQueries')
  }
  const renameSavedQuery = (name: string, row: IdbRestQuerySavedQuery) => {
    const obj = Object.assign({}, toRaw(row), { name })
    restQuerySavedQueries.update(obj)
    emit('reloadSavedQueries')
  }

  const columns = [
    { label: t('query.rest_query_history.table.headers.query'), field: 'query', name: 'query', align: 'left' },
    { label: 'Name', field: 'name', name: 'name', align: 'left', sortableCol: true },
    { label: '' },
  ]

  return {
    removeSavedQuery,
    renameSavedQuery,
    columns
  }
}