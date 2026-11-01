import { computed, Ref, ref } from 'vue'
import ElasticsearchAdapter, { ElasticsearchRequest } from '../services/ElasticsearchAdapter'
import { EsApiError, EsNetworkError } from '../services/errors.ts'
import { useClusterSession } from '../store/clusterSession.ts'
import { askConfirm } from '../helpers/dialogs'
import { SnackbarOptions, useSnackbar } from './Snackbar'
import { stringifyJson } from '../helpers/json/stringify.ts'

export interface RequestState {
  loading: boolean
  networkError: boolean
  apiError: boolean
  apiErrorMessage: string
  status: number
}

export function useElasticsearchAdapter() {
  const session = useClusterSession()
  const pinnedAdapter = session.adapter as ElasticsearchAdapter | null

  const requestState: Ref<RequestState> = ref({
    loading: false,
    networkError: false,
    apiError: false,
    apiErrorMessage: '',
    status: -1
  })

  const callElasticsearch = async <T>(request: ElasticsearchRequest<T>): Promise<T> => {
    requestState.value = { loading: true, networkError: false, apiError: false, apiErrorMessage: '', status: -1 }

    const adapter = pinnedAdapter ?? (session.adapter as ElasticsearchAdapter | null)
    if (!adapter) {
      requestState.value = { ...requestState.value, loading: false }
      throw new Error('No cluster connected')
    }

    try {
      const body = await request(adapter)
      requestState.value = { loading: false, networkError: false, apiError: false, apiErrorMessage: '', status: 200 }
      return body
    } catch (error) {
      requestState.value = errorState(error)
      console.error(error)
      throw error
    }
  }

  return {
    requestState,
    loading: computed(() => requestState.value.loading),
    callElasticsearch
  }
}

const errorState = (error: unknown): RequestState => {
  if (error instanceof EsNetworkError) {
    return { loading: false, networkError: true, apiError: false, apiErrorMessage: error.message, status: -1 }
  }
  if (error instanceof EsApiError) {
    return {
      loading: false,
      networkError: false,
      apiError: true,
      apiErrorMessage: elasticsearchError(error.body),
      status: error.status
    }
  }
  return { loading: false, networkError: false, apiError: true, apiErrorMessage: String(error), status: -1 }
}

const elasticsearchError = (body: any) => {
  if (typeof body === 'string') return body
  switch (body?.error?.type) {
    case 'index_not_found_exception':
      return 'Index not found'
    default:
      return stringifyJson(body)
  }
}

export const defineElasticsearchRequest = ({ emit }: { emit?: (event: string) => void } = {}) => {
  const { requestState, loading, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const run = async <T>({
    request,
    confirmMsg,
    snackbarOptions
  }: {
    request: ElasticsearchRequest<T>
    confirmMsg?: string
    snackbarOptions?: SnackbarOptions | ((body: T) => SnackbarOptions)
  }) => {
    if (confirmMsg) {
      const confirmed: boolean = await askConfirm(confirmMsg)
      if (!confirmed) return false
    }

    try {
      const body = await callElasticsearch(request)
      if (emit) emit('reload')
      if (typeof snackbarOptions === 'function') {
        showSnackbar(requestState.value, snackbarOptions(body))
      } else if (snackbarOptions) {
        showSnackbar(requestState.value, snackbarOptions)
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
