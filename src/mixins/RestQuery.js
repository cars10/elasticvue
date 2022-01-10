import store from '@/store'
import { computed, ref } from '@vue/composition-api'
import { useIdb } from '@/services/IdbConnection'
import { IDB_TABLE_NAMES } from '@/consts'
import { buildFetchAuthHeader } from '@/helpers'
import { parseJsonBigInt } from '@/helpers/json_parse'
import { showErrorSnackbar } from '@/mixins/ShowSnackbar'
import { vuexAccessors } from '@/helpers/store'

export const useRestQuery = () => {
  const { request } = vuexAccessors('queryRest', ['request'])
  const response = ref({ status: '', body: '' })
  const loading = ref(false)

  const activeInstance = store.getters['connection/activeInstance']

  const requestUrl = () => {
    if (request.value.path[0] === '/' || activeInstance.uri[activeInstance.uri.length - 1] === '/') {
      return activeInstance.uri + request.value.path
    } else {
      return activeInstance.uri + '/' + request.value.path
    }
  }

  const { connection } = useIdb(IDB_TABLE_NAMES.REST)
  const setupDb = async () => await connection.initialize()
  setupDb()

  const loadData = () => {
    loading.value = true
    response.value.body = '{"loading": true}'
    response.value.status = ''

    const xhr = new XMLHttpRequest()
    xhr.open(request.value.method, requestUrl(), true)
    if (activeInstance.username.length > 0) {
      xhr.setRequestHeader('Authorization', buildFetchAuthHeader(activeInstance.username, activeInstance.password))
    }
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.setRequestHeader('Accept', 'application/json')

    xhr.onload = function () {
      try {
        response.value.status = `${xhr.status} ${xhr.statusText}`
        loading.value = false
        const contentType = xhr.getResponseHeader('Content-Type')
        if (xhr.responseText && contentType.startsWith('application/json')) {
          response.value.body = parseJsonBigInt(xhr.responseText)
        } else {
          response.value.body = xhr.responseText
        }

        if (xhr.status.toString().match(/^2\d\d/)) {
          connection.dbInsert({ ...request.value, favorite: 0, date: new Date() })
        }
      } catch (e) {
        loading.value = false
        response.value.body = '// Error'
        showErrorSnackbar({ text: 'Error', additionalText: e.toString() })
      }
    }

    xhr.onerror = function () {
      loading.value = false
      response.value.body = '// Network Error'
      showErrorSnackbar({ text: 'Error', additionalText: 'Network Error' })
    }

    xhr.send(request.value.body)
  }


  const saveData = (name ='') => {
    connection.dbInsert({ ...request.value, favorite: 1, saved: 1, name, date: new Date() })
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
    request,
    response,
    loading,
    loadData,
    saveData,
    resetResponse,
    responseStatusClass
  }
}
