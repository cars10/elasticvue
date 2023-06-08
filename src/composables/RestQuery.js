import { computed, ref } from 'vue'
import { buildFetchAuthHeader } from '../helpers/elasticsearch_adapter'
import { REQUEST_DEFAULT_HEADERS } from '../consts'
import { useConnectionStore } from '../store/connection'
import { useSnackbar } from './Snackbar'
import { useIdb } from './Idb'
import { removeComments } from '../services/json/parse'
import { fetchMethod } from '../helpers/fetch'

export const useRestQuery = (request, emit) => {
  const connectionStore = useConnectionStore()
  const { showErrorSnackbar } = useSnackbar()
  const db = useIdb()

  const response = ref({ status: '', ok: false, bodyText: '' })
  const loading = ref(false)

  const sendRequest = async () => {
    loading.value = true
    response.value.status = ''

    const options = {
      method: request.method,
      body: ['GET', 'HEAD'].includes(request.method) ? null : removeComments(request.body),
      headers: Object.assign({}, REQUEST_DEFAULT_HEADERS)
    }

    if (connectionStore.activeCluster.password.length > 0) {
      options.headers.Authorization = buildFetchAuthHeader(connectionStore.activeCluster.username, connectionStore.activeCluster.password)
    }

    let url = connectionStore.activeCluster.uri
    if (!request.path.startsWith('/')) url += '/'
    url += request.path

    try {
      const fetchResponse = await fetchMethod(url, options)
      response.value.status = `${fetchResponse.status} ${fetchResponse.statusText}`
      response.value.ok = fetchResponse.ok
      const text = await fetchResponse.text()
      loading.value = false

      if (text) {
        response.value.bodyText = text
      } else {
        response.value.bodyText = ''
      }

      if (response.value.ok) saveToHistory(Object.assign({}, request))
    } catch (e) {
      console.log(e)
      loading.value = false
      response.value.bodyText = '// Network Error'
      showErrorSnackbar({ text: 'Error', body: 'Network Error' })
    }
  }

  const saveToHistory = request => {
    db.stores.restQueryHistory.insert({
      path: request.path,
      method: request.method,
      body: ['GET', 'HEAD'].includes(request.method) ? '' : request.body,
      date: new Date()
    }).then(() => (emit('reloadHistory')))
  }

  const resetResponse = () => {
    response.value = {
      body: '',
      ok: false,
      status: ''
    }
  }

  const responseStatusClass = computed(() => {
    if (response.value.status.match(/^2/)) {
      return 'bg-positive text-white'
    } else if (response.value.status.match(/^3|4/)) {
      return 'bg-orange text-black'
    } else if (response.value.status.match(/^5/)) {
      return 'bg-negative text-white'
    } else {
      return 'bg-grey'
    }
  })

  return {
    response,
    loading,
    sendRequest,
    resetResponse,
    responseStatusClass
  }
}
