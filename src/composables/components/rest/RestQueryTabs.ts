import { Ref, ref, toRaw } from 'vue'
import { HTTP_METHODS } from '../../../consts.ts'
import { useIdbStore } from '../../../db/Idb.ts'
import { IdbRestQueryTab } from '../../../db/types.ts'

const buildDefaultRequest = () => ({ method: HTTP_METHODS[1], path: '', body: '' })
const buildDefaultResponse = () => ({ status: '', ok: false, bodyText: '' })

export const useRestQueryTabs = () => {
  const { restQueryTabs } = useIdbStore()
  const tabs = ref([] as IdbRestQueryTab[])

  const activeTabName: Ref<string | null> = ref(null)

  const addTab = async () => {
    const newTab = {
      name: `tab-${Date.now()}`,
      label: `Tab ${tabs.value.length + 1}`,
      request: buildDefaultRequest(),
      response: buildDefaultResponse()
    }
    const key = await restQueryTabs.insert(newTab)
    const newIdbTab = await restQueryTabs.get(key)
    tabs.value.push(newIdbTab)
    activeTabName.value = newIdbTab.name
  }

  const updateTab = (label: string, tab: IdbRestQueryTab) => {
    restQueryTabs.update(Object.assign({}, toRaw(tab), { label }))
  }

  const removeTab = async (index: number) => {
    if (tabs.value[index].name === activeTabName.value && tabs.value[0]) {
      activeTabName.value = tabs.value[0].name
    }
    await restQueryTabs.remove(tabs.value[index].id)
    tabs.value.splice(index, 1)
  }

  const activeTabIndex = () => (tabs.value.findIndex(t => t.name === activeTabName.value) || 0)

  const loadTabs = async () => {
    tabs.value = await restQueryTabs.getAll()

    if (!activeTabName.value && tabs.value[0]) activeTabName.value = tabs.value[0].name
    if (tabs.value.length === 0) await addTab()
  }
  loadTabs()

  return {
    tabs,
    activeTabName,
    activeTabIndex,
    addTab,
    updateTab,
    removeTab
  }
}
