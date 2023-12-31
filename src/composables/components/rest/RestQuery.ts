import { useConnectionStore } from '../../../store/connection.ts'
import { computed, ref, Ref, toRaw } from 'vue'
import { useIdbStore } from '../../../db/Idb.ts'
import RestQueryFormTabs from '../../../components/rest/RestQueryFormTabs.vue'
import { IdbRestQueryTabRequest } from '../../../db/types.ts'

export const useRestQuery = () => {

  const { activeCluster } = useConnectionStore()
  const clusterMinor = computed(() => (activeCluster?.version?.split('.')?.slice(0, 2)?.join('.')))

  const { restQueryTabs } = useIdbStore()

  const tabs: Ref<InstanceType<typeof RestQueryFormTabs> | null> = ref(null)
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
    if (!request || !tabs.value) return

    const activeTab = restQueryTabs.all.value[tabs.value.activeTabIndex()]
    if (!activeTab) return

    const { id, label, name } = activeTab
    const obj = Object.assign({}, { id, label, name }, {
      request: toRaw(request),
      response: { status: '', ok: false, bodyText: '' }
    })
    await restQueryTabs.update(obj)
  }

  const useRequestInNewTab = async (request: IdbRestQueryTabRequest) => {
    if (!tabs.value) return

    await tabs.value.addTab()
    await useRequest(request)
  }

  return {
    clusterMinor,
    historyOpen,
    savedQueriesOpen,
    toggleHistory,
    toggleSavedQueries,
    useRequest,
    useRequestInNewTab
  }
}