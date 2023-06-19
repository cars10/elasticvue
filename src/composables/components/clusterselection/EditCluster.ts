import { useSnackbar } from '../../Snackbar.ts'
import { ElasticsearchCluster, useConnectionStore } from '../../../store/connection.ts'
import { ref, Ref, toRaw, watch } from 'vue'
import { useClusterConnection } from '../../ClusterConnection.js'

export type EditClusterProps = {
  index: number
}

export const useEditCluster = (props: EditClusterProps) => {
  const { showSuccessSnackbar } = useSnackbar()

  const connectionStore = useConnectionStore()

  const cluster: Ref<ElasticsearchCluster> = ref(Object.assign({}, toRaw(connectionStore.clusters[props.index])))
  const getCluster = (index: number) => (cluster.value = Object.assign({}, toRaw(connectionStore.clusters[index])))
  watch(() => props.index, getCluster)

  const formValid = ref(true)

  const dialog = ref(false)
  const saveCluster = () => {
    showSuccessSnackbar({ title: 'Cluster saved' })
    connectionStore.updateCluster({ cluster: cluster.value, index: props.index })
    dialog.value = false
  }

  watch([() => cluster.value.username, () => cluster.value.password, () => cluster.value.uri], () => {
    testRequestState.value = { success: false, error: false, loading: false, errorMessage: '' }
  })
  const { testRequestState, testConnection } = useClusterConnection(cluster)

  return {
    dialog,
    cluster,
    formValid,
    saveCluster,
    testConnection,
    testRequestState
  }
}