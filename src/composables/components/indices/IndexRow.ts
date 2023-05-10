import { onMounted, Ref, ref, watch } from 'vue'
import { useModal } from '../../Modal'
import { useElasticsearchRequest } from '../../CallElasticsearch'
import { QMenu } from 'quasar'
import { useRouter } from 'vue-router'
import { useSearchStore } from '../../../store/search'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY } from '../../../consts'

type Aliases = {
  aliases: string[]
}

type IndexAliases = Record<string, Aliases>

export const useIndexRow = ({ index, emit }: { index: string, emit: any }) => {
  const menu: Ref<QMenu | null> = ref(null)
  const aliases: Ref<string[]> = ref([])

  const { openModalWith } = useModal()
  const { requestState, data, load } = useElasticsearchRequest<IndexAliases>('indexGetAlias', { index: index })
  const loadAliases = () => {
    load().then(() => {
      if (!data.value) return

      if (!data.value[index] || !data.value[index].aliases) {
        aliases.value = []
      } else {
        aliases.value = Object.keys(data.value[index].aliases).sort()
      }
    })
  }
  onMounted(loadAliases)
  watch(() => index, loadAliases)

  const remitReloadAndCloseMenu = () => {
    emit('reload')
    menu.value?.hide()
  }

  const router = useRouter()
  const searchStore = useSearchStore()
  const showDocuments = (index: string) => {
    searchStore.indices = index
    searchStore.searchQueryCollapsed = false
    searchStore.searchQuery = DEFAULT_SEARCH_QUERY
    searchStore.pagination = DEFAULT_PAGINATION
    router.push({ name: 'search' })
  }

  return {
    menu,
    aliases,
    openModalWith,
    requestState,
    remitReloadAndCloseMenu,
    showDocuments
  }
}