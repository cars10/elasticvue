import { Ref, ref } from 'vue'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
import { useTranslation } from './i18n'
import { useSnackbar } from './Snackbar'
import { ElasticsearchCluster, ElasticsearchClusterCredentials, useConnectionStore } from '../store/connection'
import { DISTRIBUTIONS } from '../consts.ts'

type TestConnectState = {
  success: boolean
  error: boolean
  loading: boolean
  errorMessage: string
}

const resetState = (state: Ref<TestConnectState>) => {
  state.value = {
    success: false,
    error: false,
    loading: false,
    errorMessage: ''
  }
}

export const useClusterConnection = (cluster: Ref<ElasticsearchCluster>) => {
  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const { showSuccessSnackbar } = useSnackbar()

  const formValid = ref(true)

  const testState = ref<TestConnectState>({} as TestConnectState)
  const connectState = ref<TestConnectState>({} as TestConnectState)

  const testConnection = async () => {
    resetState(testState)
    resetState(connectState)
    testState.value.loading = true

    const adapter = new ElasticsearchAdapter(cluster.value as ElasticsearchClusterCredentials)
    try {
      await adapter.test()
      testState.value.success = true
      testState.value.loading = false

      showSuccessSnackbar({ title: t('defaults.success'), body: t('mixins.test_connection.cluster_reachable') })
    } catch (e: any) {
      console.error(e)
      testState.value.success = false
      testState.value.error = true
      testState.value.loading = false
      if (e.status && e.statusText) {
        testState.value.errorMessage = `${e.status} ${e.statusText}`
      } else if (e.message) {
        testState.value.errorMessage = e.message
      }
    }
  }

  const connect = async () => {
    resetState(testState)
    resetState(connectState)
    connectState.value.loading = true

    const adapter = new ElasticsearchAdapter(cluster.value as ElasticsearchClusterCredentials)
    try {
      const infoResponse: any = await adapter.test()
      const infoJson = await infoResponse.json()

      const clusterHealthResponse: any = await adapter.clusterHealth()
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
        majorVersion: infoJson.version.number[0],
        distribution: infoJson.version.distribution || DISTRIBUTIONS.elasticsearch,
        uuid: clusterUuid(infoJson),
        status: clusterHealthBody.status
      })

      connectState.value.success = true
      connectState.value.loading = false

      return newIdx
    } catch (e: any) {
      console.error(e)
      connectState.value.success = false
      connectState.value.error = true
      connectState.value.loading = false
      if (e.status && e.statusText) {
        connectState.value.errorMessage = `${e.status} ${e.statusText}`
      } else if (e.message) {
        connectState.value.errorMessage = e.message
      }

      return Promise.reject(e)
    }
  }

  return {
    testState,
    connectState,
    testConnection,
    connect,
    formValid
  }
}

export const clusterUuid = (infoJson: any) => {
  if (infoJson.cluster_uuid) return infoJson.cluster_uuid

  // fallback for elasticsearch < 5
  return `${infoJson.cluster_name}-${infoJson.name}`.replaceAll(/\s/g, '')
}