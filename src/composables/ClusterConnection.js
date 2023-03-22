import { computed, ref } from 'vue'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
import { useTranslation } from './i18n'
import { useSnackbar } from './Snackbar'
import { useConnectionStore } from '../store/connection'

const DEFAULT_NAME = 'default cluster'
const DEFAULT_URI = 'http://localhost:9200'

export const useClusterConnection = () => {
  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const { showSuccessSnackbar } = useSnackbar()

  const formValid = ref(true)
  const newCluster = ref({})

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

    const adapter = new ElasticsearchAdapter(newCluster.value)
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
      } else {
        testRequestState.value.errorMessage = e.message
      }
    }
  }

  const connect = async () => {
    connectRequestState.value.loading = true
    connectRequestState.value.success = false
    connectRequestState.value.error = false

    const adapter = new ElasticsearchAdapter(newCluster.value)
    try {
      const infoResponse = await adapter.test()
      const infoJson = await infoResponse.json()

      const clusterHealthResponse = await adapter.clusterHealth()
      const clusterHealthBody = await clusterHealthResponse.json()

      let uri = newCluster.value.uri.trim()
      if (uri.endsWith('/')) uri = uri.slice(0, -1)
      const newIdx = connectionStore.addCluster({
        name: newCluster.value.name.trim(),
        username: newCluster.value.username,
        password: newCluster.value.password,
        uri,
        clusterName: infoJson.cluster_name,
        version: infoJson.version.number,
        majorVersion: parseInt(infoJson.version.number[0]),
        uuid: infoJson.cluster_uuid,
        status: clusterHealthBody.status
      })

      resetCluster()

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

  const resetCluster = () => {
    newCluster.value = {
      name: DEFAULT_NAME,
      username: '',
      password: '',
      uri: DEFAULT_URI
    }
  }
  resetCluster()

  const validUri = uri => {
    try {
      new URL(uri)
      if (/^https?:\/\/.*/.test(uri)) {
        formValid.value = true
        return true
      }
    } catch (e) {
      formValid.value = false
      return 'Invalid uri'
    }
  }

  const clusterHostSSL = computed(() => (newCluster.value.uri.match(/^https/)))

  return {
    newCluster,
    testRequestState,
    connectRequestState,
    testConnection,
    connect,
    resetCluster,
    validUri,
    formValid,
    clusterHostSSL
  }
}
