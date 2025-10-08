import { useSnackbar } from '../../Snackbar.ts'
import { ElasticsearchCluster, ElasticsearchClusterConnection, useConnectionStore } from '../../../store/connection.ts'
import { ref, Ref, watch } from 'vue'
import { useClusterConnection } from '../../ClusterConnection.js'

export type EditClusterProps = {
  index: number
}

export const useEditCluster = (props: EditClusterProps) => {
  const { showSuccessSnackbar } = useSnackbar()

  const connectionStore = useConnectionStore()

  const getCluster = (index: number): ElasticsearchClusterConnection => {
    const savedCluster: ElasticsearchCluster = connectionStore.clusters[index]
    return {
      name: savedCluster.name,
      uri: savedCluster.uri,
      auth: Object.assign({}, savedCluster.auth)
    }
  }
  const cluster: Ref<ElasticsearchClusterConnection> = ref(getCluster(props.index))
  watch(
    () => props.index,
    (index) => (cluster.value = getCluster(index))
  )

  const dialog = ref(false)
  const saveCluster = () => {
    connectionStore.updateCluster({ cluster: cluster.value, index: props.index })
    showSuccessSnackbar({ title: 'Cluster saved' })
    window.location.reload()
  }

  watch([() => cluster.value], () => {
    testState.value = { success: false, error: false, loading: false, errorMessage: '' }
  })
  const { testState, testConnection } = useClusterConnection(cluster)

  return {
    dialog,
    cluster,
    saveCluster,
    testConnection,
    testState
  }
}
