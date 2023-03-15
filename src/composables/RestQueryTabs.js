import { ref, toRaw } from 'vue'
import { buildDefaultRequest } from '../consts'

export const useRestQueryTabs = restQueryTabs => {
  const tabs = ref([])
  const activeTabName = ref(null)

  const reloadTabs = async () => {
    tabs.value = await restQueryTabs.getAll()
    if (!activeTabName.value && tabs.value[0]) activeTabName.value = tabs.value[0].name
  }

  const addTab = async () => {
    const newTab = {
      name: `tab-${Date.now()}`,
      label: `Tab ${tabs.value.length + 1}`,
      request: buildDefaultRequest()
    }
    await restQueryTabs.insert(newTab)
    await reloadTabs()
    activeTabName.value = tabs.value[tabs.value.length - 1].name
  }

  const updateTab = (label, tab) => {
    restQueryTabs.update(Object.assign({}, toRaw(tab), { label }))
  }

  const removeTab = async index => {
    await restQueryTabs.remove(tabs.value[index].id)
    if (tabs.value[index].name === activeTabName.value && tabs.value[0]) activeTabName.value = tabs.value[0].name
    tabs.value.splice(index, 1)
  }

  const activeTabIndex = () => (tabs.value.findIndex(t => t.name === activeTabName.value) || 0)

  return {
    tabs,
    activeTabName,
    activeTabIndex,
    reloadTabs,
    addTab,
    updateTab,
    removeTab
  }
}
