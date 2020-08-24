import store from '@/store'

export const showSuccessSnackbar = function (props) {
  store.commit('snackbar/show', Object.assign({}, { timeout: 5000, color: 'green' }, props))
}

export const showErrorSnackbar = function (props) {
  if (props.text) console.error(props.text)
  if (props.additionalText) console.error(props.additionalText)
  store.commit('snackbar/show', Object.assign({}, { timeout: 20000, color: 'red' }, props))
}
