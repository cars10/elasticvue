import { computed, ref } from 'vue'
import { buildFetchAuthHeader } from '@/helpers'
import { fetchMethod } from '@/services/tauri/fetchReqwest'
import { useRestQueryStore } from '../store/rest_query'

export const useRestQuery = () => {
  const restQueryStore = useRestQueryStore()
  const response = ref({ status: '', body: '' })
  const loading = ref(false)

  //  const activeInstance = store.getters['connection/activeInstance']
  // const requestUrl = () => {
  // if (request.value.path[0] === '/' || activeInstance.uri[activeInstance.uri.length - 1] === '/') {
  //     return activeInstance.uri + request.value.path
  //   } else {
  //     return activeInstance.uri + '/' + request.value.path
  //   }
  // }

  // const { connection } = useIdb(IDB_TABLE_NAMES.REST)
  // const setupDb = async () => await connection.initialize()
  // setupDb()

  const loadData = () => {
    loading.value = true
    response.value.body = '{"loading": true}'
    response.value.status = ''

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    if (activeInstance.password.length > 0) {
      headers.Authorization = buildFetchAuthHeader(activeInstance.username, activeInstance.password)
    }

    fetchMethod(requestUrl(), {
      method: request.value.method,
      body: ['GET', 'HEAD'].includes(request.value.method) ? null : request.value.body,
      headers
    }).then(r => {
      response.value.status = `${r.status} ${r.statusText}`
      return r.text()
    }).then(text => {
      loading.value = false

      if (text) {
        try {
          response.value.body = parseJsonBigInt(text)
        } catch (e) {
          response.value.body = text
        }
      } else {
        response.value.body = ''
      }

      if (response.value.status.toString().match(/^2\d\d/)) {
        connection.dbInsert({
          path: request.value.path,
          method: request.value.method,
          body: ['GET', 'HEAD'].includes(request.value.method) ? '' : request.value.body,
          favorite: 0,
          date: new Date()
        })
      }
    }).catch(e => {
      console.log(e)
      loading.value = false
      response.value.body = '// Network Error'
      showErrorSnackbar({ text: 'Error', body: 'Network Error' })
    })
  }

  const resetResponse = () => {
    response.value = {
      body: '',
      status: ''
    }
  }

  const responseStatusClass = computed(() => {
    if (!response.value.status || response.value.status.length === 0) return 'grey'

    if (response.value.status.match(/^2/)) {
      return 'green black--text'
    } else if (response.value.status.match(/^3|4/)) {
      return 'darken-2 yellow black--text'
    } else if (response.value.status.match(/^5/)) {
      return 'red black--text'
    }

    return 'grey'
  })

  return {
    restQueryStore,
    response,
    loading,
    loadData,
    resetResponse,
    responseStatusClass
  }
}
