import { ref, toRaw } from 'vue'
import { HTTP_METHODS } from '../../../consts.ts'
import { useIdbStore } from '../../../db/Idb.ts'
import { IdbRestQueryTab } from '../../../db/types.ts'
import { useRestStore } from '../../../store/rest.ts'

const buildDefaultRequest = () => ({ method: HTTP_METHODS[1], path: '', body: '' })
const buildDefaultResponse = () => ({ status: '', ok: false, bodyText: '' })

export const useRestQueryTabs = () => {
  const { restQueryTabs } = useIdbStore()
  const restStore = useRestStore()
  const tabs = ref([] as IdbRestQueryTab[])

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
    restStore.activeTabIndex = tabs.value.length - 1
  }

  const updateTab = (label: string, tab: IdbRestQueryTab) => {
    restQueryTabs.update(Object.assign({}, toRaw(tab), { label }))
  }

  const removeTab = async (index: number) => {
    if (index === restStore.activeTabIndex) {
      if (tabs.value.length > 1) {
        restStore.activeTabIndex = index === 0 ? 0 : index - 1
      }
    } else if (index < restStore.activeTabIndex) {
      restStore.activeTabIndex = restStore.activeTabIndex - 1
    }
    await restQueryTabs.remove(tabs.value[index].id)
    tabs.value.splice(index, 1)
    if (tabs.value.length === 0) {
      restStore.activeTabIndex = 0
    } else if (restStore.activeTabIndex >= tabs.value.length) {
      restStore.activeTabIndex = tabs.value.length - 1
    }
  }

  const loadTabs = async () => {
    tabs.value = await restQueryTabs.getAll()

    if (tabs.value.length === 0) {
      await addTab()
    } else {
      // Ensure activeTabIndex is valid
      if (restStore.activeTabIndex < 0 || restStore.activeTabIndex >= tabs.value.length) {
        restStore.activeTabIndex = 0
      }
    }
  }
  loadTabs()

  const setTabContent = ({ method, path, body }: { method: string; path: string; body: string }) => {
    const idx = restStore.activeTabIndex
    if (idx < 0 || idx >= tabs.value.length) return null
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
    addTab,
    updateTab,
    removeTab
  }
}
