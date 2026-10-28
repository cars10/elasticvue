import stripJsonComments from 'strip-json-comments'
import { computed, nextTick, ref, watch } from 'vue'
import { clusterAuthHeader } from '../../../helpers/elasticsearchAdapter.ts'
import { REQUEST_DEFAULT_HEADERS } from '../../../consts'
import { useConnectionStore } from '../../../store/connection'
import { useRestStore } from '../../../store/rest.ts'
import { useSnackbar } from '../../Snackbar'
import { fetchMethod } from '../../../helpers/fetch'
import { parseKibana } from '../../../helpers/parseKibana.ts'
import { prettyPrintByteString } from '../../../helpers/bytes.ts'
import { emptyResponse, hasNoBody, responseStatusColor, restRequestUrl, sameRequest } from '../../../helpers/rest.ts'
import type { RestTab } from '../../../helpers/rest.ts'

export const useRestQueryForm = (tab: RestTab) => {
  const connectionStore = useConnectionStore()
  const restStore = useRestStore()
  const { showErrorSnackbar } = useSnackbar()
  const loading = ref(false)

  watch(
    () => tab.request,
    () => restStore.saveTab(tab),
    { deep: true }
  )

  const sendRequest = async () => {
    const cluster = connectionStore.activeCluster
    if (!cluster) return

    const request = { ...tab.request }
    const headers: Record<string, string> = { ...REQUEST_DEFAULT_HEADERS }
    const authHeader = clusterAuthHeader(cluster.auth)
    if (authHeader) headers.Authorization = authHeader

    loading.value = true
    tab.response.status = ''
    const start = performance.now()

    try {
      const response = await fetchMethod(restRequestUrl(cluster.uri, request.path), {
        method: request.method,
        headers,
        body: hasNoBody(request.method) ? null : stripJsonComments(request.body)
      })
      tab.response = {
        status: `${response.status} ${response.statusText}`,
        ok: response.ok,
        bodyText: await response.text(),
        duration: Math.round(performance.now() - start)
      }
      if (response.ok) restStore.addHistory(request)
    } catch (e) {
      console.error(e)
      tab.response = { ...emptyResponse(), bodyText: '// Network Error' }
      showErrorSnackbar({ title: 'Error', body: 'Network Error' })
    } finally {
      loading.value = false
      restStore.saveTab(tab, { withResponse: true })
    }
  }

  const statusColor = computed(() => responseStatusColor(tab.response.status))
  const responseSize = computed(() => prettyPrintByteString(new TextEncoder().encode(tab.response.bodyText).length))
  const noBody = computed(() => hasNoBody(tab.request.method))
  const isSaved = computed(() => restStore.savedQueries.some((query) => sameRequest(query, tab.request)))

  const saveQuery = (name: string) => restStore.saveQuery(tab.request, name)

  const editorCommands = ['Ctrl-Enter', 'Cmd-Enter'].map((key) => ({
    key,
    run: () => {
      sendRequest()
      return true
    }
  }))

  const generateDownloadData = () => tab.response.bodyText
  const downloadFileName = computed(() => `${tab.request.method.toLowerCase()}_${tab.request.path.replace(/[\W_]+/g, '_')}.json`)

  const onPaste = (data: string) => {
    const { method, path, body } = parseKibana(data)
    if (!method) return

    nextTick(() => Object.assign(tab.request, { method, path: path || '', body: body || '' }))
  }

  return {
    loading,
    sendRequest,
    statusColor,
    responseSize,
    noBody,
    isSaved,
    saveQuery,
    editorCommands,
    generateDownloadData,
    downloadFileName,
    onPaste
  }
}
