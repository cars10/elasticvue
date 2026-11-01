import { Ref, ref, UnwrapRef, useTemplateRef } from 'vue'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
import { useTranslation } from './i18n'
import { useSnackbar } from './Snackbar'
import { BuildFlavor, ElasticsearchClusterConnection, useConnectionStore } from '../store/connection'
import { DISTRIBUTIONS } from '../consts.ts'
import { QForm } from 'quasar'

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

export const useClusterConnection = (
  formCluster: Ref<UnwrapRef<ElasticsearchClusterConnection>>,
  connectCallback?: (id: string) => void
) => {
  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const { showSuccessSnackbar } = useSnackbar()

  const form = useTemplateRef<QForm>('form')

  const testState = ref<TestConnectState>({} as TestConnectState)
  const connectState = ref<TestConnectState>({} as TestConnectState)

  const formValid = async () => {
    if (!form.value) return false
    return await form.value.validate(false)
  }

  const testConnection = async () => {
    if (!(await formValid())) return

    resetState(testState)
    resetState(connectState)
    testState.value.loading = true

    const adapter = new ElasticsearchAdapter(formCluster.value)
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

    const adapter = new ElasticsearchAdapter(formCluster.value)
    try {
      const infoJson = await adapter.test()

      const flavor = infoJson.version.build_flavor || BuildFlavor.default

      let status
      if (flavor === BuildFlavor.serverless) {
        status = 'green'
      } else {
        const clusterHealthBody = await adapter.clusterHealth()
        status = clusterHealthBody.status
      }

      let uri = formCluster.value.uri.trim()
      if (uri.endsWith('/')) uri = uri.slice(0, -1)
      const id = connectionStore.addCluster({
        name: formCluster.value.name.trim(),
        clusterName: infoJson.cluster_name,
        version: infoJson.version.number,
        majorVersion: infoJson.version.number[0],
        distribution: infoJson.version.distribution || DISTRIBUTIONS.elasticsearch,
        uuid: clusterUuid(infoJson),
        status,
        loading: false,
        uri,
        flavor,
        auth: formCluster.value.auth
      })

      connectState.value.success = true
      connectState.value.loading = false

      return id
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

  const connectAndRedirect = async () => {
    if (!(await formValid())) return

    try {
      const id = await connect()
      if (!id) return

      connectCallback?.(id)
    } catch (_e) {
      console.error(_e)
    }
  }

  return {
    testState,
    connectState,
    testConnection,
    connectAndRedirect,
    form,
    formValid
  }
}

export const clusterUuid = (infoJson: any) => {
  if (infoJson.cluster_uuid) return infoJson.cluster_uuid

  // fallback for elasticsearch < 5
  return `${infoJson.cluster_name}-${infoJson.name}`.replaceAll(/\s/g, '')
}
