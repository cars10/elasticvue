import { onMounted, Ref, ref, watch } from 'vue'
import { useModal } from '../../Modal'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { QMenu } from 'quasar'
import { useRouter } from 'vue-router'
import { useSearchStore } from '../../../store/search'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY } from '../../../consts'
import ElasticsearchIndex from '../../../models/ElasticsearchIndex.ts'
import { handleError } from '../../../helpers/error.ts'

type Aliases = {
  aliases: string[]
}

type IndexAliases = Record<string, Aliases>

export type IndexRowProps = {
  index: ElasticsearchIndex
}

export const useIndexRow = (props: IndexRowProps, emit: any) => {
  const menu: Ref<QMenu | null> = ref(null)
  const aliases: Ref<string[]> = ref([])

  const { openModalWith } = useModal()
  const loadAliases = async (index: string) => {
    try {
      await load(index)
      if (!data.value) return

      if (!data.value[props.index.index] || !data.value[props.index.index].aliases) {
        aliases.value = []
      } else {
        aliases.value = Object.keys(data.value[props.index.index].aliases).sort()
      }
    } catch (e) {
      handleError(e)
      aliases.value = []
    }
  }

  const { loading, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<IndexAliases | null> = ref(null)

  const load = async (index: string) => {
    try {
      data.value = await callElasticsearch('indexGetAlias', { index })
    } catch (e) {
      handleError(e)
      data.value = null
    }
  }

  onMounted(() => (loadAliases(props.index.index)))
  watch(() => props.index, (newValue) => loadAliases(newValue.index))

  const emitReloadAndCloseMenu = () => {
    emit('reload')
    menu.value?.hide()
  }

  const router = useRouter()
  const searchStore = useSearchStore()
  const showDocuments = (index: string) => {
    const tabName = `tab-doc-${Date.now()}`
    searchStore.tabs.push({
      name: tabName,
      label: index.toUpperCase(),
      q: '*',
      filter: '',
      indices: index,
      searchQuery: DEFAULT_SEARCH_QUERY,
      searchQueryCollapsed: false,
      columns: [],
      visibleColumns: [],
      columnOrder: [],
      stickyTableHeader: false,
      pagination: Object.assign({}, DEFAULT_PAGINATION),
      rowsPerPageAccepted: false,
      searchHistory: [],
      searchResults: null,
      executeOnMount: true
    })
    searchStore.activeTab = tabName

    router.push({ name: 'search' })
  }

  return {
    menu,
    aliases,
    openModalWith,
    loading,
    emitReloadAndCloseMenu,
    showDocuments
  }
}