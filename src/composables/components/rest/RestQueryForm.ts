import { computed, ref, toRaw, watch, nextTick } from 'vue'
import { buildFetchAuthHeader } from '../../../helpers/elasticsearchAdapter.ts'
import { REQUEST_DEFAULT_HEADERS } from '../../../consts'
import { useConnectionStore } from '../../../store/connection'
import { useSnackbar } from '../../Snackbar'
import { useIdbStore } from '../../../db/Idb'
import { removeComments } from '../../../helpers/json/parse'
import { fetchMethod } from '../../../helpers/fetch'
import { IdbRestQueryTab, IdbRestQueryTabRequest } from '../../../db/types.ts'
import { debounce } from '../../../helpers/debounce.ts'
import { parseKibana } from '../../../helpers/parseKibana.ts'

type RestQueryFormProps = {
  tab: IdbRestQueryTab
}

type RestFetchOptions = {
  method: string
  body: string | null
  headers: Record<string, string>
}

export const useRestQueryForm = (props: RestQueryFormProps, emit: any) => {
  const connectionStore = useConnectionStore()
  const { showErrorSnackbar } = useSnackbar()
  const { restQueryTabs, restQueryHistory, restQuerySavedQueries } = useIdbStore()

  const ownTab = ref(props.tab)
  let updateIdb = true

  const loading = ref(false)

  const sendRequest = async () => {
    if (!connectionStore.activeCluster) return

    loading.value = true
    props.tab.response.status = ''

    const options: RestFetchOptions = {
      method: props.tab.request.method,
      body: ['GET', 'HEAD'].includes(props.tab.request.method) ? null : removeComments(props.tab.request.body),
      headers: Object.assign({}, REQUEST_DEFAULT_HEADERS)
    }

    if (connectionStore.activeCluster.password.length > 0) {
      options.headers.Authorization = buildFetchAuthHeader(connectionStore.activeCluster.username, connectionStore.activeCluster.password)
    }

    let url = connectionStore.activeCluster.uri
    if (!url.endsWith('/') && !props.tab.request.path.startsWith('/')) url += '/'
    url += props.tab.request.path

    try {
      const fetchResponse = await fetchMethod(url, options)
      props.tab.response.status = `${fetchResponse.status} ${fetchResponse.statusText}`
      props.tab.response.ok = fetchResponse.ok
      const text = await fetchResponse.text()
      loading.value = false

      if (text) {
        props.tab.response.bodyText = text
      } else {
        props.tab.response.bodyText = ''
      }

      if (props.tab.response.ok) saveToHistory(Object.assign({}, props.tab.request))
    } catch (e) {
      console.log(e)
      loading.value = false
      props.tab.response.bodyText = '// Network Error'
      showErrorSnackbar({ title: 'Error', body: 'Network Error' })
    }
  }

  const saveToHistory = async (request: IdbRestQueryTabRequest) => {
    const prev = await restQueryHistory.last()
    if (prev?.method === request.method && prev?.path === request.path && prev?.body === request.body) return

    const count = await restQueryHistory.count()
    if (count >= 1000) {
      const first = await restQueryHistory.first()
      if (first) await restQueryHistory.remove(first.id)
    }

    restQueryHistory.insert({
      path: request.path,
      method: request.method,
      body: ['GET', 'HEAD'].includes(request.method) ? '' : request.body,
      date: new Date()
    })
    emit('reloadHistory')
  }

  const responseStatusClass = computed(() => {
    if (props.tab.response.status.match(/^2/)) {
      return 'bg-positive text-white'
    } else if (props.tab.response.status.match(/^3|4/)) {
      return 'bg-orange text-black'
    } else if (props.tab.response.status.match(/^5/)) {
      return 'bg-negative text-white'
    } else {
      return 'bg-grey'
    }
  })

  const saveQuery = () => {
    const { method, path, body } = toRaw(ownTab.value.request)
    restQuerySavedQueries.insert({ method, path, body })
    emit('reloadSavedQueries')
  }

  watch(ownTab.value.request, value => {
    if (updateIdb) updateTab({ request: toRaw(value) })
  })
  watch(ownTab.value.response, value => {
    if (updateIdb) updateTab({ response: toRaw(value) })
  })
  const updateTab = debounce((value: object) => {
    const obj = Object.assign({}, toRaw(props.tab), value)
    restQueryTabs.update(obj)
  }, 100)

  watch(() => props.tab, newValue => {
    updateIdb = false
    ownTab.value.request.method = newValue.request.method
    ownTab.value.request.path = newValue.request.path
    ownTab.value.request.body = newValue.request.body
    updateIdb = true
  })

  const editorCommands = [{
    key: 'Ctrl-Enter', run: () => {
      sendRequest()
      return true
    }
  }]

  const generateDownloadData = () => (ownTab.value.response.bodyText)
  const downloadFileName = computed(() => {
    return `${ownTab.value.request.method.toLowerCase()}_${ownTab.value.request.path.replace(/[\W_]+/g, '_')}.json`
  })

  const onPaste = (data: string) => {
    const kibanaRequest = parseKibana(data)

      nextTick(() => {
      if (kibanaRequest.method) {
        ownTab.value.request.method = kibanaRequest.method
        ownTab.value.request.path = kibanaRequest.path ||  ''
        ownTab.value.request.body = kibanaRequest.body ||  ''
      }
    })
  }

  return {
    saveQuery,
    ownTab,
    editorCommands,
    generateDownloadData,
    downloadFileName,
    loading,
    sendRequest,
    responseStatusClass,
    onPaste
  }
}
