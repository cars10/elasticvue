import { ref } from 'vue'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
import { useTranslation } from './i18n'
import { useSnackbar } from './Snackbar'
import { useConnectionStore } from '../store/connection'

export const useClusterConnection = ({ cluster }) => {
  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const { showSuccessSnackbar } = useSnackbar()

  const formValid = ref(true)

  const testRequestState = ref({
    success: false,
    error: false,
    loading: false,
    errorMessage: ''
  })

  const connectRequestState = ref({
    success: false,
    error: false,
    loading: false,
    errorMessage: ''
  })

  const testConnection = async () => {
    testRequestState.value.loading = true
    testRequestState.value.success = false
    testRequestState.value.error = false

    const adapter = new ElasticsearchAdapter(cluster.value)
    try {
      await adapter.test()
      testRequestState.value.success = true
      connectRequestState.value.error = false
      testRequestState.value.loading = false

      showSuccessSnackbar({ title: t('defaults.success'), body: t('mixins.test_connection.cluster_reachable') })
    } catch (e) {
      testRequestState.value.loading = false
      testRequestState.value.error = true
      if (e instanceof TypeError) {
        testRequestState.value.errorMessage = t('mixins.test_connection.cluster_not_reachable')
      } else if (e.message) {
        testRequestState.value.errorMessage = e.message
      }
    }
  }

  const connect = async () => {
    connectRequestState.value.loading = true
    connectRequestState.value.success = false
    connectRequestState.value.error = false

    const adapter = new ElasticsearchAdapter(cluster.value)
    try {
      const infoResponse = await adapter.test()
      const infoJson = await infoResponse.json()

      const clusterHealthResponse = await adapter.clusterHealth()
      const clusterHealthBody = await clusterHealthResponse.json()

      let uri = cluster.value.uri.trim()
      if (uri.endsWith('/')) uri = uri.slice(0, -1)
      const newIdx = connectionStore.addCluster({
        name: cluster.value.name.trim(),
        username: cluster.value.username,
        password: cluster.value.password,
        uri,
        clusterName: infoJson.cluster_name,
        version: infoJson.version.number,
        majorVersion: parseInt(infoJson.version.number[0]),
        uuid: infoJson.cluster_uuid,
        status: clusterHealthBody.status
      })

      connectRequestState.value.success = true
      testRequestState.value.error = false
      connectRequestState.value.loading = false

      return newIdx
    } catch (e) {
      console.log(e)
      connectRequestState.value.loading = false
      connectRequestState.value.error = true

      return Promise.reject(e)
    }
  }

  return {
    testRequestState,
    connectRequestState,
    testConnection,
    connect,
    formValid
  }
}
