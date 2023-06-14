import { onMounted, Ref, ref, watch } from 'vue'
import { useModal } from '../../Modal'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { QMenu } from 'quasar'
import { useRouter } from 'vue-router'
import { useSearchStore } from '../../../store/search'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY } from '../../../consts'

type Aliases = {
  aliases: string[]
}

type IndexAliases = Record<string, Aliases>

export const useIndexRow = ({ props, emit }: { props: any, emit: any }) => {
  const menu: Ref<QMenu | null> = ref(null)
  const aliases: Ref<string[]> = ref([])

  const { openModalWith } = useModal()
  const loadAliases = (index: string) => {
    load(index).then(() => {
      if (!data.value) return

      if (!data.value[props.index.index] || !data.value[props.index.index].aliases) {
        aliases.value = []
      } else {
        aliases.value = Object.keys(data.value[props.index.index].aliases).sort()
      }
    })
  }

  const { loading, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<IndexAliases | null> = ref(null)

  const load = (index: string) => {
    return callElasticsearch('indexGetAlias', { index })
        .then(body => (data.value = body))
        .catch(() => (data.value = null))
  }

  onMounted(() => (loadAliases(props.index.index)))
  watch(() => props.index, (newValue) => loadAliases(newValue.index))

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
    loading,
    remitReloadAndCloseMenu,
    showDocuments
  }
}