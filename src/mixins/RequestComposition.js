import { ref } from '@vue/composition-api'
import cachedAdapter from '@/mixins/GetAdapter'
import { parseJsonBigInt, stringifyJsonBigInt } from '@/helpers/json_parse'

export function useElasticsearchRequest () {
  const requestState = ref({
    loading: false,
    networkError: false,
    apiError: false,
    apiErrorMessage: '',
    elasticsearchErrorType: '',
    elasticsearchErrorReason: ''
  })

  const callElasticsearch = async (method, ...args) => {
    requestState.value = {
      loading: true,
      networkError: false,
      apiError: false,
      apiErrorMessage: '',
      elasticsearchErrorType: '',
      elasticsearchErrorReason: '',
      status: -1
    }

    try {
      const adapter = cachedAdapter()
      await adapter.ping()

      try {
        const response = await adapter[method](...args)
        if (!response) return Promise.resolve()

        const contentType = response.headers.get('content-type')
        let body
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text()
          body = parseJsonBigInt(text)
        } else {
          body = true
        }

        requestState.value = {
          loading: false,
          networkError: false,
          apiError: false,
          apiErrorMessage: '',
          elasticsearchErrorType: '',
          elasticsearchErrorReason: '',
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
            apiErrorMessage: stringifyJsonBigInt(errorJson),
            status: errorResponse.status
          }

          if (errorJson && errorJson.error) {
            requestState.value.elasticsearchErrorType = errorJson.error.type
            requestState.value.elasticsearchErrorReason = errorJson.error.reason
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
        elasticsearchErrorType: '',
        elasticsearchErrorReason: '',
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

export function setupElasticsearchRequest (method, params) {
  const { requestState, callElasticsearch } = useElasticsearchRequest()
  const data = ref(null)

  const load = () => {
    callElasticsearch(method, params)
      .then(body => (data.value = body))
      .catch(() => (data.value = null))
  }

  return {
    requestState,
    data,
    load
  }
}
