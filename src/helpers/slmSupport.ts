import { computed } from 'vue'
import { useConnectionStore } from '../store/connection'

/**
 * Helper to check if Snapshot Lifecycle Management (SLM) is supported
 * SLM was introduced in Elasticsearch 7.4.0
 */
export const useSlmSupport = () => {
  const connectionStore = useConnectionStore()

  const isSlmSupported = computed(() => {
    const cluster = connectionStore.activeCluster
    if (!cluster) return false

    const majorVersion = cluster.majorVersion
    if (!majorVersion) return false

    // SLM was introduced in ES 7.4.0
    if (parseInt(majorVersion) < 7) return false
    if (parseInt(majorVersion) === 7 && cluster.version < '7.4.0') return false

    return true
  })

  return {
    isSlmSupported
  }
}
