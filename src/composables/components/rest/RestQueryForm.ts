import { computed, ref, toRaw } from 'vue'
import { buildFetchAuthHeader } from '../../../helpers/elasticsearchAdapter.ts'
import { REQUEST_DEFAULT_HEADERS } from '../../../consts'
import { useConnectionStore } from '../../../store/connection'
import { useSnackbar } from '../../Snackbar'
import { useIdbStore } from '../../../db/Idb'
import { removeComments } from '../../../helpers/json/parse'
import { fetchMethod } from '../../../helpers/fetch'
import { IdbRestQueryTabRequest, IdbRestQueryTabResponse } from '../../../db/types.ts'

type RestFetchOptions = {
  method: string
  body: string | null
  headers: Record<string, string>
}

export const useRestQueryForm = (request: IdbRestQueryTabRequest, response: IdbRestQueryTabResponse) => {
  const connectionStore = useConnectionStore()
  const { showErrorSnackbar } = useSnackbar()
  const { restQueryHistory } = useIdbStore()

  const loading = ref(false)

  const sendRequest = async () => {
    if (!connectionStore.activeCluster) return

    loading.value = true
    response.status = ''

    const options: RestFetchOptions = {
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
      response.status = `${fetchResponse.status} ${fetchResponse.statusText}`
      response.ok = fetchResponse.ok
      const text = await fetchResponse.text()
      loading.value = false

      if (text) {
        response.bodyText = text
      } else {
        response.bodyText = ''
      }

      if (response.ok) saveToHistory(Object.assign({}, request))
    } catch (e) {
      console.log(e)
      loading.value = false
      response.bodyText = '// Network Error'
      showErrorSnackbar({ title: 'Error', body: 'Network Error' })
    }
  }

  const saveToHistory = (request: IdbRestQueryTabRequest) => {
    const prev = toRaw(restQueryHistory.last())
    if (prev?.method === request.method && prev?.path === request.path && prev?.body === request.body) return

    restQueryHistory.insert({
      path: request.path,
      method: request.method,
      body: ['GET', 'HEAD'].includes(request.method) ? '' : request.body,
      date: new Date()
    })
  }

  const responseStatusClass = computed(() => {
    if (response.status.match(/^2/)) {
      return 'bg-positive text-white'
    } else if (response.status.match(/^3|4/)) {
      return 'bg-orange text-black'
    } else if (response.status.match(/^5/)) {
      return 'bg-negative text-white'
    } else {
      return 'bg-grey'
    }
  })

  return {
    loading,
    sendRequest,
    responseStatusClass
  }
}
