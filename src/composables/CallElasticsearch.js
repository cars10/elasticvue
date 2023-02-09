import { ref } from 'vue'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
import { useConnectionStore } from '../store/connection'

const elasticsearchAdapter = ref(null)

export function useElasticsearchAdapter () {
  const connectionStore = useConnectionStore()

  const requestState = ref({
    loading: false,
    networkError: false,
    apiError: false,
    apiErrorMessage: ''
  })

  const callElasticsearch = async (method, ...args) => {
    requestState.value = {
      loading: true,
      networkError: false,
      apiError: false,
      apiErrorMessage: '',
      status: -1
    }

    try {
      if (!elasticsearchAdapter.value) {
        elasticsearchAdapter.value = new ElasticsearchAdapter(connectionStore.activeCluster)
        await elasticsearchAdapter.value.ping()
      }

      try {
        const response = await elasticsearchAdapter.value[method](...args)
        if (!response) return Promise.resolve()

        const contentType = response.headers.get('content-type')
        let body
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text()
          body = JSON.parse(text)
        } else {
          body = true
        }

        requestState.value = {
          loading: false,
          networkError: false,
          apiError: false,
          apiErrorMessage: '',
          status: response.status
        }

        return Promise.resolve(body)
      } catch (errorResponse) {
        if (errorResponse.json) {
          const errorJson = await errorResponse.json()
          requestState.value = {
            loading: false,
            networkError: false,
            apiError: true,
            apiErrorMessage: JSON.stringify(errorJson),
            status: errorResponse.status
          }

          console.error('Elasticsearch API error', errorJson)
          return Promise.reject(new Error('API error'))
        } else {
          requestState.value = {
            loading: false,
            networkError: false,
            apiError: true,
            apiErrorMessage: errorResponse.toString(),
            status: -1
          }
          return Promise.reject(new Error('Request error'))
        }
      }
    } catch (error) {
      requestState.value = {
        loading: false,
        networkError: true,
        apiError: false,
        apiErrorMessage: '',
        status: -1
      }
      console.error(error)
      return Promise.reject(new Error('Error'))
    }
  }

  return {
    requestState,
    callElasticsearch
  }
}

export function useElasticsearchRequest (method, params) {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const data = ref(null)

  const load = () => {
    return callElasticsearch(method, params)
      .then(body => (data.value = body))
      .catch(() => (data.value = null))
  }

  return {
    requestState,
    data,
    load
  }
}
