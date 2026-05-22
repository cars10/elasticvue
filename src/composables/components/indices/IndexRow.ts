import { useTemplateRef } from 'vue'
import { useModal } from '../../Modal'
import { QMenu } from 'quasar'
import { useRouter } from 'vue-router'
import { useSearchStore } from '../../../store/search'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY, DEFAULT_SEARCH_QUERY_OBJ } from '../../../consts'
import ElasticsearchIndex from '../../../models/ElasticsearchIndex.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'

export type IndexRowProps = {
  index: ElasticsearchIndex
}

export const useIndexRow = (_props: IndexRowProps, emit: any) => {
  const menu = useTemplateRef<QMenu>('menu')

  const { openModalWith } = useModal()

  const emitReloadAndCloseMenu = () => {
    emit('reload')
    menu.value?.hide()
  }

  const router = useRouter()
  const searchStore = useSearchStore()
  const showDocuments = (index: string) => {
    searchStore.indices = index
    searchStore.searchQueryCollapsed = false
    searchStore.searchQuery = DEFAULT_SEARCH_QUERY
    searchStore.q = 'q'

    const rowsPerPage = searchStore.pagination.rowsPerPage
    searchStore.pagination = Object.assign({}, DEFAULT_PAGINATION)
    if (rowsPerPage && rowsPerPage > 0 && rowsPerPage <= 10000) {
      searchStore.searchQuery = stringifyJson(Object.assign({}, DEFAULT_SEARCH_QUERY_OBJ, { size: rowsPerPage }))
      searchStore.pagination.rowsPerPage = rowsPerPage
    }

    router.push({ name: 'search' })
  }

  return {
    menu,
    openModalWith,
    emitReloadAndCloseMenu,
    showDocuments
  }
}
