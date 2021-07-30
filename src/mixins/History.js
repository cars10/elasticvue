import { useIdb } from '@/services/IdbConnection'
import { ref, watch } from '@vue/composition-api'
import { useAsyncFilter } from '@/mixins/UseAsyncTableFilter'
import { debounce } from '@/helpers'
import { IDB_TABLE_DEFINITIONS } from '@/consts'

export const useHistory = tableName => {
  const { connection } = useIdb(tableName)
  connection.initialize()

  const favoriteItem = item => connection.dbUpdate(Object.assign({}, item, { favorite: !item.favorite ? 1 : 0 }))
  const removeItem = id => connection.dbDelete(id)
  const clearAll = () => {
    if (confirm('Are you sure? This will remove all entries from your history.')) connection.dbClear()
  }
  const clearNonFavorites = () => {
    return connection.dbClearNonFavorites()
  }

  const filter = ref('')
  const onlyFavorites = ref(false)
  const items = ref([])

  const { asyncFilterTable } = useAsyncFilter()

  const filterTable = async () => {
    let results = connection.entries.value
    if (onlyFavorites.value) results = results.filter(entry => entry.favorite === 1)
    items.value = await asyncFilterTable(results, filter.value, IDB_TABLE_DEFINITIONS[tableName].filterableColumns)
  }
  const debouncedFilterTable = debounce(filterTable, 350)
  watch(filter, debouncedFilterTable)
  watch([onlyFavorites, connection.entries], filterTable)

  return {
    connection,
    loading: connection.loading,
    favoriteItem,
    removeItem,
    clearAll,
    clearNonFavorites,
    items,
    filter,
    onlyFavorites
  }
}
