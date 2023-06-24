import { Ref, ref, toRaw } from 'vue'
import { buildDefaultRequest } from '../../../consts.ts'
import { useIdbStore } from '../../../db/Idb.ts'
import { IdbRestQueryTab } from '../../../db/types.ts'

export const useRestQueryTabs = () => {
  const { restQueryTabs } = useIdbStore()
  const activeTabName: Ref<string | null> = ref(null)

  const setActiveTab = async () => {
    await restQueryTabs.reload()
    if (!activeTabName.value && restQueryTabs.all.value[0]) activeTabName.value = restQueryTabs.all.value[0].name
    if (restQueryTabs.all.value.length === 0) addTab()
  }

  const addTab = async () => {
    const newTab = {
      name: `tab-${Date.now()}`,
      label: `Tab ${restQueryTabs.all.value.length + 1}`,
      request: buildDefaultRequest()
    }
    await restQueryTabs.insert(newTab)
    activeTabName.value = restQueryTabs.all.value[restQueryTabs.all.value.length - 1].name
  }

  const updateTab = (label: string, tab: IdbRestQueryTab) => {
    restQueryTabs.update(Object.assign({}, toRaw(tab), { label }))
  }

  const removeTab = async (index: number) => {
    if (restQueryTabs.all.value[index].name === activeTabName.value && restQueryTabs.all.value[0]) {
      activeTabName.value = restQueryTabs.all.value[0].name
    }
    await restQueryTabs.remove(restQueryTabs.all.value[index].id)
  }

  const activeTabIndex = () => (restQueryTabs.all.value.findIndex(t => t.name === activeTabName.value) || 0)

  return {
    activeTabName,
    activeTabIndex,
    setActiveTab,
    addTab,
    updateTab,
    removeTab
  }
}
