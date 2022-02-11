import store from '@/store'

const TIMEOUTS = {
  default: 5000,
  warning: 8000,
  error: 20000
}

export const showSuccessSnackbar = function (props) {
  store.commit('snackbar/show', Object.assign({}, { timeout: TIMEOUTS.default, color: 'success' }, props))
}

export const showErrorSnackbar = function (props) {
  if (props.body) console.error(props.body)
  store.commit('snackbar/show', Object.assign({}, { timeout: TIMEOUTS.error, color: 'error' }, props))
}

export const showDefaultSnackbar = function (props) {
  store.commit('snackbar/show', Object.assign({}, { timeout: TIMEOUTS.default, color: 'grey' }, props))
}

export const showSnackbar = function (requestState, successOptions = {}) {
  const snackbarOptions = { timeout: 0, color: '', title: '', body: '' }
  const status = requestState.status.toString()

  if (status.match(/2\d\d/)) {
    snackbarOptions.timeout = TIMEOUTS.default
    snackbarOptions.color = 'success'
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
    } else {
      snackbarOptions.title = status
    }

    const errorMessage = responseErrorMessage(requestState.apiErrorMessage)
    if (errorMessage && errorMessage.error) {
      snackbarOptions.title += ` - ${errorMessage.error.type}`
      snackbarOptions.body = `Reason: ${errorMessage.error.reason}`
    } else {
      snackbarOptions.body = requestState.apiErrorMessage
    }
  } else if (status.match(/5\d\d/)) {
    snackbarOptions.timeout = TIMEOUTS.error
    snackbarOptions.color = 'error'
    snackbarOptions.title = '500 Elasticsearch server error'

    const errorMessage = responseErrorMessage(requestState.apiErrorMessage)
    if (errorMessage && errorMessage.error) {
      snackbarOptions.title += ` - ${errorMessage.error.type}`
      snackbarOptions.body = `Reason: ${errorMessage.error.reason}`
    } else {
      snackbarOptions.body = requestState.apiErrorMessage
    }
  } else if (requestState.status === -1) {
    snackbarOptions.timeout = TIMEOUTS.error
    snackbarOptions.color = 'error'
    snackbarOptions.title = 'Request error'
    snackbarOptions.body = requestState.apiErrorMessage
  }

  snackbarOptions.copyableText = requestState.apiErrorMessage

  store.commit('snackbar/show', snackbarOptions)
}

const responseErrorMessage = json => {
  try {
    if (json && json.length > 0) {
      return JSON.parse(json)
    }
  } catch (e) {
  }
}
