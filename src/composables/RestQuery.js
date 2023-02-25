import { computed, ref } from 'vue'
import { buildFetchAuthHeader } from '../helpers/elasticsearch_adapter'
import { buildDefaultRequest, fetchMethod, REQUEST_DEFAULT_HEADERS } from '../consts'
import { useConnectionStore } from '../store/connection'
import { useSnackbar } from './Snackbar'

export const useRestQuery = (request, queryHistory) => {
  const connectionStore = useConnectionStore()
  const { showErrorSnackbar } = useSnackbar()

  const response = ref({ status: '', ok: false, bodyText: '' })
  const loading = ref(false)

  const resetRequest = () => {
    const defaultRequest = buildDefaultRequest()
    for (const [key, value] of Object.entries(defaultRequest)) {
      request[key] = value
    }

    response.value.status = ''
    response.value.ok = false
    response.value.bodyText = ''
  }

  const sendRequest = () => {
    loading.value = true
    response.value.status = ''

    const options = {
      method: request.method,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
      headers: Object.assign({}, REQUEST_DEFAULT_HEADERS)
    }

    if (connectionStore.activeCluster.password.length > 0) {
      options.headers.Authorization = buildFetchAuthHeader(connectionStore.activeCluster.username, connectionStore.activeCluster.password)
    }

    let url = connectionStore.activeCluster.uri
    if (!request.path.startsWith('/')) url += '/'
    url += request.path

    fetchMethod(url, options).then(r => {
      response.value.status = `${r.status} ${r.statusText}`
      response.value.ok = r.ok
      return r.text()
    }).then(text => {
      loading.value = false

      if (text) {
        response.value.bodyText = text
      } else {
        response.value.bodyText = ''
      }

      if (response.value.ok) {
        queryHistory.insert({
          path: request.path,
          method: request.method,
          body: ['GET', 'HEAD'].includes(request.method) ? '' : request.body,
          date: new Date()
        })
      }
    }).catch(e => {
      console.log(e)
      loading.value = false
      response.value.bodyText = '// Network Error'
      showErrorSnackbar({ text: 'Error', body: 'Network Error' })
    })
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
    resetRequest,
    response,
    loading,
    sendRequest,
    resetResponse,
    responseStatusClass
  }
}
