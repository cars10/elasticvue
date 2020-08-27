import { ref } from '@vue/composition-api'
import esAdapter from '@/mixins/GetAdapter'
import store from '@/store'

export function useRequest () {
  const requestState = ref({
    loading: false,
    networkError: false,
    apiError: false,
    apiErrorMessage: ''
  })

  const callElasticsearch = async (method, params) => {
    requestState.value = { loading: true, networkError: false, apiError: false, apiErrorMessage: '' }
    try {
      const adapter = await esAdapter()
      await adapter.ping()

      try {
        const response = await adapter[method](params)
        requestState.value = { loading: false, networkError: false, apiError: false, apiErrorMessage: '' }
        if (!store.state.connection.wasConnected) store.commit('connection/setConnected')
        return Promise.resolve(response)
      } catch (error) {
        requestState.value = { loading: false, networkError: false, apiError: true, apiErrorMessage: error }
        return Promise.reject(Error('API Error'))
      }
    } catch (error) {
      requestState.value = { loading: false, networkError: true, apiError: false, apiErrorMessage: '' }
      store.commit('connection/setDisconnected')
      return Promise.reject(Error('Network Error'))
    }
  }

  return {
    requestState,
    callElasticsearch
  }
}

export function callApi (method, params) {
  const { requestState, callElasticsearch } = useRequest()
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
