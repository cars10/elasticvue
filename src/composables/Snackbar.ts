import { useSnackbarStore } from '../store/snackbar'
import { RequestState } from './CallElasticsearch'

const TIMEOUTS = {
  default: 5000,
  warning: 8000,
  error: 20000
}

interface SnackbarSuccessOptions {
  title?: string
  body?: string
}

export interface SnackbarOptions extends SnackbarSuccessOptions {
  timeout?: number
  color?: string
  copyableText?: string
}

export const useSnackbar = () => {
  const store = useSnackbarStore()

  const showSuccessSnackbar = (props: SnackbarOptions) => {
    store.show(Object.assign({}, { timeout: TIMEOUTS.default, color: 'positive' }, props))
  }

  const showErrorSnackbar = (props: SnackbarOptions) => {
    if (props.body) console.error(props.body)
    store.show(Object.assign({}, { timeout: TIMEOUTS.error, color: 'negative' }, props))
  }

  const showDefaultSnackbar = (props: SnackbarOptions) => {
    store.show(Object.assign({}, { timeout: TIMEOUTS.default, color: 'grey' }, props))
  }

  const showSnackbar = (requestState: RequestState, successOptions: SnackbarSuccessOptions = {}) => {
    const snackbarOptions: SnackbarOptions = { timeout: 0, color: '', title: '', body: '' }
    const status = requestState.status.toString()

    if (status.match(/2\d\d/)) {
      snackbarOptions.timeout = TIMEOUTS.default
      snackbarOptions.color = 'positive'
      snackbarOptions.title = '200 OK'
      if (successOptions.title) snackbarOptions.title += ` - ${successOptions.title}`
      if (successOptions.body) snackbarOptions.body = successOptions.body
    } else if (status.match(/4\d\d/)) {
      snackbarOptions.timeout = TIMEOUTS.warning
      snackbarOptions.color = 'warning'

      if (status === '400') {
        snackbarOptions.title = '400 Bad Request'
      } else if (status === '401') {
        snackbarOptions.title = '401 Not authorized'
      } else if (status === '404') {
        snackbarOptions.title = '404 Not found'
      } else if (status === '405') {
        snackbarOptions.title = '405 Not allowed'
      } else {
        snackbarOptions.title = status
      }

      const errorMessage = responseErrorMessage(requestState.apiErrorMessage)
      if (errorMessage && errorMessage.error) {
        if (errorMessage.error.type && errorMessage.error.reason) {
          snackbarOptions.title += ` - ${errorMessage.error.type}`
          snackbarOptions.body = `Reason: ${errorMessage.error.reason}`
        } else if (typeof errorMessage.error === 'string') {
          snackbarOptions.body = errorMessage.error
        }
      } else {
        snackbarOptions.body = requestState.apiErrorMessage
      }
    } else if (status.match(/5\d\d/)) {
      snackbarOptions.timeout = TIMEOUTS.error
      snackbarOptions.color = 'negative'
      snackbarOptions.title = '500 Elasticsearch server error'

      const errorMessage = responseErrorMessage(requestState.apiErrorMessage)
      if (errorMessage && errorMessage.error?.type) {
        snackbarOptions.title += ` - ${errorMessage.error.type}`
        snackbarOptions.body = `Reason: ${errorMessage.error.reason}.`

        if (errorMessage.error.caused_by?.reason) {
          snackbarOptions.body += ` Caused by: ${errorMessage.error.caused_by.reason}`
        }
      } else {
        snackbarOptions.body = requestState.apiErrorMessage
      }
    } else if (requestState.status === -1) {
      snackbarOptions.timeout = TIMEOUTS.error
      snackbarOptions.color = 'negative'
      snackbarOptions.title = 'Request error'
      snackbarOptions.body = requestState.apiErrorMessage
    }

    snackbarOptions.copyableText = requestState.apiErrorMessage

    store.show(snackbarOptions)
  }

  return {
    showSuccessSnackbar,
    showErrorSnackbar,
    showDefaultSnackbar,
    showSnackbar
  }
}

const responseErrorMessage = (json: string) => {
  try {
    if (json && json.length > 0) {
      return JSON.parse(json)
    }
  } catch (_e) {}
}
