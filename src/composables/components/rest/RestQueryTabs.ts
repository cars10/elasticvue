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

  const loadTabs = async () => {
    tabs.value = await restQueryTabs.getAll()

    if (!activeTabName.value && tabs.value[0]) activeTabName.value = tabs.value[0].name
    if (tabs.value.length === 0) await addTab()
  }
  loadTabs()

  const activeTabIndex = () => tabs.value.findIndex((t) => t.name === activeTabName.value) || 0

  const setTabContent = ({ method, path, body }: { method: string; path: string; body: string }) => {
    const idx = activeTabIndex()
    tabs.value[idx].request.method = method
    tabs.value[idx].request.path = path
    tabs.value[idx].request.body = body
    tabs.value[idx].response.status = ''
    tabs.value[idx].response.ok = false
    tabs.value[idx].response.bodyText = ''

    const obj = toRaw(tabs.value[idx])
    restQueryTabs.update(obj)
    return obj
  }

  return {
    setTabContent,
    tabs,
    activeTabName,
    addTab,
    updateTab,
    removeTab
  }
}
