import { computed, ref } from 'vue'
import { useRestStore } from '../../../store/rest.ts'
import { REST_QUERY_EXAMPLES } from '../../../consts.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { askConfirm } from '../../../helpers/dialogs.ts'
import { formatTimeAgo } from '../../../helpers/time.ts'
import { savedQueryName } from '../../../helpers/rest.ts'
import { useTranslation } from '../../i18n.ts'
import type { IdbRestQueryTabRequest } from '../../../db/types.ts'

export type RestQueryLibraryItem = IdbRestQueryTabRequest & {
  key: string
  caption: string
  id?: number
  doc?: string
}

export const useRestQueryLibrary = () => {
  const t = useTranslation()
  const restStore = useRestStore()
  const filter = ref('')

  const tabItems = computed((): RestQueryLibraryItem[] => {
    switch (restStore.libraryTab) {
      case 'history':
        return restStore.history
          .slice()
          .reverse()
          .map((h) => ({ ...h, key: `h-${h.id}`, caption: h.date ? formatTimeAgo(new Date(h.date).getTime()) : '' }))
      case 'saved':
        return restStore.savedQueries.map((s) => ({ ...s, key: `s-${s.id}`, caption: savedQueryName(s) }))
      default:
        return REST_QUERY_EXAMPLES.map((e) => ({ ...e, key: `e-${e.method}-${e.path}`, caption: e.description }))
    }
  })

  const filterColumns = computed(() => (restStore.libraryTab === 'history' ? ['method', 'path'] : ['method', 'path', 'caption']))
  const items = computed(() => filterItems(tabItems.value, filter.value, filterColumns.value))

  const removeItem = (item: RestQueryLibraryItem) =>
    restStore.libraryTab === 'history' ? restStore.removeHistory(item.id) : restStore.removeQuery(item.id)

  const clearHistory = async () => {
    if (await askConfirm(t('query.library.clear_history_confirm'))) restStore.clearHistory()
  }

  return { restStore, filter, items, removeItem, clearHistory }
}
