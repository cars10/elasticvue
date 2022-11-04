import store from '@/store'
import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
import { computed } from 'vue'

export const usePathRepoInfo = () => {
  const instance = store.getters['connection/activeInstance']
  const method = instance.major_version > 6 ? 'clusterSettings' : 'nodes'
  const { load, requestState, data } = setupElasticsearchRequest(method)

  const pathRepo = computed(() => {
    if (!data.value) return ''

    if (method === 'clusterSettings') {
      if (!data.value.defaults) return ''
      if (!data.value.defaults.path) return ''
      return data.value.defaults.path.repo
    } else {
      if (!data.value.nodes) return ''
      const node = Object.values(data.value.nodes)[0]
      if (!node) return ''
      if (!node.settings) return ''
      if (!node.settings.path) return ''
      return node.settings.path.repo
    }
  })

  return {
    load,
    requestState,
    pathRepo
  }
}
