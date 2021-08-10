import store from '@/store'

export const showSuccessSnackbar = function (props) {
  store.commit('snackbar/show', Object.assign({}, { timeout: 5000, color: 'success' }, props))
}

export const showErrorSnackbar = function (props) {
  if (props.additionalText) console.error(props.additionalText)
  store.commit('snackbar/show', Object.assign({}, { timeout: 20000, color: 'error' }, props))
}
