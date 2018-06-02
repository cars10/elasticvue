export const snackbar = {
  state: {
    visible: false,
    timeout: 6000,
    color: null,
    text: '',
    additionalText: ''
  },
  mutations: {
    showSnackbar (state, props) {
      state.text = props.text || ''
      state.additionalText = props.additionalText || ''
      if (props.timeout) state.timeout = props.timeout
      if (props.color) state.color = props.color
      state.visible = true
    },
    setSnackbarVisible (state, visible) {
      state.visible = visible
    }
  }
}
