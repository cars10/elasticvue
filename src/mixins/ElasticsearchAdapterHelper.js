import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'
import esAdapter from '@/mixins/GetAdapter'

export const elasticsearchRequest = function (options) {
  if (options.confirmMessage && options.confirmMessage.length !== 0) {
    if (confirm(options.confirmMessage)) {
      return runRequest(options)
    }
  } else {
    return runRequest(options)
  }
}

const runRequest = function (options) {
  return esAdapter()
    .then(adapter => adapter[options.method](options.methodParams))
    .then(body => {
      if (typeof options.callback === 'function') options.callback(body)
      if (options.growl) {
        showSuccessSnackbar({
          text: options.growl,
          additionalText: JSON.stringify(body)
        })
      }
      return Promise.resolve(body)
    })
    .catch(error => {
      if (!options.silenceError) {
        showErrorSnackbar({ text: 'Error:', additionalText: error.message })
      }
    })
}
