import { useSnackbar } from '../../Snackbar.ts'
import { ElasticsearchCluster, ElasticsearchClusterConnection, useConnectionStore } from '../../../store/connection.ts'
import { ref, Ref, watch } from 'vue'
import { useClusterConnection } from '../../ClusterConnection.js'
import { useClusterSession } from '../../../store/clusterSession.ts'

export type EditClusterProps = {
  id: string
}

export const useEditCluster = (props: EditClusterProps) => {
  const { showSuccessSnackbar } = useSnackbar()

  const connectionStore = useConnectionStore()
  const session = useClusterSession()

  const getCluster = (id: string): ElasticsearchClusterConnection => {
    const savedCluster = connectionStore.clusterById(id) as ElasticsearchCluster
    return {
      name: savedCluster.name,
      uri: savedCluster.uri,
      auth: Object.assign({}, savedCluster.auth)
    }
  }
  const cluster: Ref<ElasticsearchClusterConnection> = ref(getCluster(props.id))
  watch(
    () => props.id,
    (id) => (cluster.value = getCluster(id))
  )

  const dialog = ref(false)
  const saveCluster = () => {
    connectionStore.updateCluster({ cluster: cluster.value, id: props.id })
    showSuccessSnackbar({ title: 'Cluster saved' })
    if (props.id === session.clusterId) session.reconnect()
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
