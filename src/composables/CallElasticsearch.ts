import { Ref, ref } from 'vue'
import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
import { useConnectionStore } from '../store/connection'
import { askConfirm } from '../helpers/dialogs'
import { SnackbarOptions, useSnackbar } from './Snackbar'

let elasticsearchAdapter: ElasticsearchAdapter

export interface RequestState {
  loading: boolean,
  networkError: boolean,
  apiError: boolean,
  apiErrorMessage: string,
  status: number
}

export function useElasticsearchAdapter () {
  const connectionStore = useConnectionStore()

  const requestState: Ref<RequestState> = ref({
    loading: false,
    networkError: false,
    apiError: false,
    apiErrorMessage: '',
    status: -1
  })

  const callElasticsearch = async (method: keyof ElasticsearchAdapter, ...args: any[]) => {
    requestState.value = {
      loading: true,
      networkError: false,
      apiError: false,
      apiErrorMessage: '',
      status: -1
    }

    try {
      if (!elasticsearchAdapter) {
        // @ts-ignore
        elasticsearchAdapter = new ElasticsearchAdapter(connectionStore.activeCluster)
        await elasticsearchAdapter.ping()
      }

      try {
        const response = await elasticsearchAdapter.call(method, ...args)
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
      } catch (errorResponse: any) {
        if (typeof errorResponse === 'object' && errorResponse.json) {
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

/*
 * Use this when you need to make a "static" call to elasticsearch with fixed parameters and options, e.g. loading all
 * indices or the cluster stats.
 *
 * @example
 *   const { requestState, data, load } = useElasticsearchRequest('clusterInfo')
 *   onMounted(load)
 */
export function useElasticsearchRequest (method: keyof ElasticsearchAdapter, params?: object) {
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

/*
 * Use this when you need to make a call to elasticsearch with changing parameters, e.g. for deleting specific indices
 * or snapshot repositories.
 *
 * @example
 *   const emit = defineEmits(['reload'])
 *   const callDelete = defineElasticsearchRequest({ emit, method: 'snapshotDeleteRepository' })
 *   const deleteRepository = async (name) => {
 *     return callDelete({
 *       confirmMsg: t('repositories.repositories_table.delete_repository.confirm', { name }),
 *       params: { repository: name },
 *       snackbarOptions: { body: t('repositories.repositories_table.delete_repository.growl', { name }) }
 *     })
 *   }
 */
export const defineElasticsearchRequest = ({ emit, method }: {
  emit: Function,
  method: keyof ElasticsearchAdapter
}) => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  return async ({ confirmMsg, snackbarOptions, params = undefined }: {
    confirmMsg: string,
    snackbarOptions: SnackbarOptions,
    params?: object
  }) => {
    const confirmed: boolean = await askConfirm(confirmMsg)
    if (!confirmed) return

    try {
      await callElasticsearch(method, params)
      if (emit) emit('reload')
      showSnackbar(requestState.value, snackbarOptions)
    } catch (e) {
      showSnackbar(requestState.value)
    }
  }
}
