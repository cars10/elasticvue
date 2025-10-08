import { useConnectionStore } from '../../../store/connection.ts'
import { computed, ref, Ref, toRaw } from 'vue'
import { useIdbStore } from '../../../db/Idb.ts'
import { IdbRestQueryHistory, IdbRestQuerySavedQuery, IdbRestQueryTabRequest } from '../../../db/types.ts'
import RestQueryFormTabs from '../../../components/rest/RestQueryFormTabs.vue'

export const useRestQuery = (formTabs: Ref<typeof RestQueryFormTabs | null>) => {
  const { activeCluster } = useConnectionStore()
  const clusterMinor = computed(() => activeCluster?.version?.split('.')?.slice(0, 2)?.join('.'))

  const { restQueryTabs, restQueryHistory, restQuerySavedQueries } = useIdbStore()
  const history = ref([] as IdbRestQueryHistory[])
  const savedQueries = ref([] as IdbRestQuerySavedQuery[])

  const reloadHistory = async () => (history.value = await restQueryHistory.getAll())
  reloadHistory()

  const reloadSavedQueries = async () => (savedQueries.value = await restQuerySavedQueries.getAll())
  reloadSavedQueries()

  const historyOpen = ref(false)
  const savedQueriesOpen = ref(false)
  const toggleHistory = () => {
    historyOpen.value = !historyOpen.value
    savedQueriesOpen.value = false
  }
  const toggleSavedQueries = () => {
    savedQueriesOpen.value = !savedQueriesOpen.value
    historyOpen.value = false
  }

  const useRequest = async (request: IdbRestQueryTabRequest) => {
    if (!request || !formTabs.value) return

    const obj = formTabs.value.setTabContent(toRaw(request))
    await restQueryTabs.update(obj)
  }

  const useRequestInNewTab = async (request: IdbRestQueryTabRequest) => {
    if (!formTabs.value) return

    await formTabs.value.addTab()
    await useRequest(request)
  }

  return {
    reloadHistory,
    reloadSavedQueries,
    clusterMinor,
    savedQueries,
    history,
    historyOpen,
    savedQueriesOpen,
    toggleHistory,
    toggleSavedQueries,
    useRequest,
    useRequestInNewTab
  }
}
