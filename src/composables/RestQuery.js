import { computed, ref } from 'vue'
import { useRestQueryStore } from '../store/rest_query'
import { buildFetchAuthHeader } from '../helpers/elasticsearch_adapter'
import { fetchMethod, REQUEST_DEFAULT_HEADERS } from '../consts'
import { useConnectionStore } from '../store/connection'
import { useSnackbar } from './Snackbar'

export const useRestQuery = () => {
  const restQueryStore = useRestQueryStore()
  const connectionStore = useConnectionStore()
  const { showErrorSnackbar } = useSnackbar()

  const response = ref({ status: '', ok: false, bodyText: '' })
  const loading = ref(false)

  // const { connection } = useIdb(IDB_TABLE_NAMES.REST)
  // const setupDb = async () => await connection.initialize()
  // setupDb()

  const resetRequest = () => {
    restQueryStore.$reset()
  }

  const sendRequest = () => {
    loading.value = true
    response.value.status = ''

    const options = {
      method: restQueryStore.request.method,
      body: ['GET', 'HEAD'].includes(restQueryStore.request.method) ? null : restQueryStore.request.body,
      headers: Object.assign({}, REQUEST_DEFAULT_HEADERS)
    }

    if (connectionStore.activeCluster.password.length > 0) {
      options.headers.Authorization = buildFetchAuthHeader(connectionStore.activeCluster.username, connectionStore.activeCluster.password)
    }

    let url = connectionStore.activeCluster.uri
    if (!restQueryStore.request.path.startsWith('/')) url += '/'
    url += restQueryStore.request.path

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
        /*connection.dbInsert({
          path: restQueryStore.request.path,
          method: restQueryStore.request.method,
          body: ['GET', 'HEAD'].includes(restQueryStore.request.method) ? '' : restQueryStore.request.body,
          favorite: 0,
          date: new Date()
        })*/
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
