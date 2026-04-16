import { computed, Ref, ref } from 'vue'
import ElasticsearchAdapter, { ElasticsearchMethod } from '../services/ElasticsearchAdapter'
import { AuthType, getAwsCredentialType, useConnectionStore } from '../store/connection'
import { askConfirm } from '../helpers/dialogs'
import { SnackbarOptions, useSnackbar } from './Snackbar'
import { parseJson } from '../helpers/json/parse.ts'
import { resolveConnectionForAdapter } from '../helpers/awsCredentials.ts'

// Helper type to extract all parameters from a method
type MethodParameters<T> = T extends (...args: infer P) => any ? P : never

// Extract parameter types for each method
type ElasticsearchMethodParams = {
  [K in ElasticsearchMethod]: MethodParameters<ElasticsearchAdapter[K]>
}

// Type-safe callElasticsearch overload
type CallElasticsearchOverload = {
  <M extends ElasticsearchMethod>(method: M, ...args: ElasticsearchMethodParams[M]): Promise<any>
}

let elasticsearchAdapter: ElasticsearchAdapter

const shouldRefreshAwsProfileCredentials = () => {
  const connectionStore = useConnectionStore()
  const cluster = connectionStore.activeCluster
  if (!cluster || cluster.auth.authType !== AuthType.awsIAM) return false
  return getAwsCredentialType(cluster.auth) === 'profile'
}

export interface RequestState {
  loading: boolean
  networkError: boolean
  apiError: boolean
  apiErrorMessage: string
  status: number
}

export function useElasticsearchAdapter() {
  const connectionStore = useConnectionStore()

  const requestState: Ref<RequestState> = ref({
    loading: false,
    networkError: false,
    apiError: false,
    apiErrorMessage: '',
    status: -1
  })

  const callElasticsearch: CallElasticsearchOverload = async (method: ElasticsearchMethod, ...args: any[]) => {
    requestState.value = {
      loading: true,
      networkError: false,
      apiError: false,
      apiErrorMessage: '',
      status: -1
    }

    try {
      const cluster = connectionStore.activeCluster
      if (!cluster) return

      let adapter = elasticsearchAdapter
      if (shouldRefreshAwsProfileCredentials()) {
        const resolved = await resolveConnectionForAdapter(cluster)
        adapter = new ElasticsearchAdapter(resolved)
      } else if (!elasticsearchAdapter) {
        const resolved = await resolveConnectionForAdapter(cluster)
        elasticsearchAdapter = new ElasticsearchAdapter(resolved)
        await elasticsearchAdapter.ping()
        adapter = elasticsearchAdapter
      }

      try {
        const response = await adapter.call(method, ...args)
        if (!response) return Promise.resolve()

        if (Array.isArray(response)) {
          requestState.value = {
            loading: false,
            networkError: false,
            apiError: false,
            apiErrorMessage: '',
            status: 200
          }
          let result
          if (response.every((r: Response) => r.ok)) {
            result = { acknowledged: true }
          } else {
            result = { apiErrorMessage: 'Some requests failed.' }
          }

          return Promise.resolve(result)
        }

        const contentType = response.headers.get('content-type')
        let body
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text()
          body = parseJson(text)
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
            apiErrorMessage: elasticsearchError(errorJson),
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
          console.error(errorResponse)
          return Promise.reject(new Error('Request error'))
        }
      }
    } catch (error: any) {
      requestState.value = {
        loading: false,
        networkError: true,
        apiError: false,
        apiErrorMessage: error?.message ?? '',
        status: -1
      }
      console.error(error)
      return Promise.reject(error)
    }
  }

  return {
    requestState,
    loading: computed(() => requestState.value.loading),
    callElasticsearch
  }
}

const elasticsearchError = (error: any) => {
  switch (error.error?.type) {
    case 'index_not_found_exception':
      return 'Index not found'
    default:
      return JSON.stringify(error)
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
export function useElasticsearchRequest<T>(method: ElasticsearchMethod, params?: object) {
  const { requestState, loading, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<T | null> = ref(null)

  const load = () => {
    if (params !== undefined) {
      return callElasticsearch(method, params as any)
        .then((body) => (data.value = body))
        .catch(() => (data.value = null))
    } else {
      return callElasticsearch(method as any)
        .then((body) => (data.value = body))
        .catch(() => (data.value = null))
    }
  }

  return {
    requestState,
    loading,
    data,
    load
  }
}

/*
  Use this when you need to make a call to elasticsearch with changing parameters, e.g. for deleting specific indices
  or snapshot repositories.

  @example
    const emit = defineEmits(['reload'])
    const { run, loading } = defineElasticsearchRequest({ emit, method: 'index' })
    const deleteRepository = async (name) => {
      return run({
        params: { repository: name },
        snackbarOptions: { body: t('repositories.repositories_table.delete_repository.growl', { name }) }
      })
    }
 */
export const defineElasticsearchRequest = ({ emit, method }: { emit?: (event: string) => void; method: ElasticsearchMethod }) => {
  const { requestState, loading, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const run = async ({
    confirmMsg,
    snackbarOptions,
    params = undefined
  }: {
    confirmMsg?: string
    snackbarOptions?: SnackbarOptions | SnackbarOptionsFunction
    params?: object
  }) => {
    if (confirmMsg) {
      const confirmed: boolean = await askConfirm(confirmMsg)
      if (!confirmed) return false
    }

    try {
      const body = params !== undefined ? await callElasticsearch(method, params as any) : await callElasticsearch(method as any)
      if (emit) emit('reload')
      if (snackbarOptions) {
        if (typeof snackbarOptions === 'function') {
          showSnackbar(requestState.value, snackbarOptions.call(null, body))
        } else {
          showSnackbar(requestState.value, snackbarOptions)
        }
      }
      return true
    } catch (_e) {
      showSnackbar(requestState.value)
      return false
    }
  }

  return {
    run,
    requestState,
    loading
  }
}

type SnackbarOptionsFunction = (body: any) => SnackbarOptions
