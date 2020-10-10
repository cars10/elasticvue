import { ref } from '@vue/composition-api'
import cachedAdapter from '@/mixins/GetAdapter'
import store from '@/store'

export function useElasticsearchRequest () {
  const requestState = ref({
    loading: false,
    networkError: false,
    apiError: false,
    apiErrorMessage: ''
  })

  const callElasticsearch = async (method, params) => {
    requestState.value = { loading: true, networkError: false, apiError: false, apiErrorMessage: '', status: -1 }

    try {
      const adapter = cachedAdapter()
      await adapter.ping()

      try {
        const response = await adapter[method](params)
        requestState.value = {
          loading: false,
          networkError: false,
          apiError: false,
          apiErrorMessage: '',
          status: response.status
        }

        const contentType = response.headers.get('content-type')
        let body
        if (contentType && contentType.includes('application/json')) {
          body = await response.json()
        } else {
          body = true
        }

        return Promise.resolve(body)
      } catch (errorResponse) {
        const errorJson = await errorResponse.json()
        requestState.value = {
          loading: false,
          networkError: false,
          apiError: true,
          apiErrorMessage: JSON.stringify(errorJson),
          status: errorResponse.status
        }
        console.error(errorJson)
        return Promise.reject(new Error('API Error'))
      }
    } catch (error) {
      requestState.value = { loading: false, networkError: true, apiError: false, apiErrorMessage: '', status: -1 }
      store.commit('connection/setDisconnected')
      return Promise.reject(new Error('Network Error'))
    }
  }

  return {
    requestState,
    callElasticsearch
  }
}

export function setupElasticsearchRequest (method, params) {
  const { requestState, callElasticsearch } = useElasticsearchRequest()
  const data = ref(null)

  const load = () => {
    callElasticsearch(method, params)
      .then(body => (data.value = body))
      .catch(() => (data.value = {}))
  }

  return {
    requestState,
    data,
    load
  }
}
