export const snackbar = {
  state: {
    visible: false,
    timeout: 5000,
    color: null,
    text: ''
  },
  mutations: {
    showSnackbar (state, props) {
      state.text = props.text || ''
      if (props.timeout) state.timeout = props.timeout
      if (props.color) state.color = props.color
      state.visible = true
    },
    setSnackbarVisible (state, visible) {
      state.visible = visible
    }
  }
}
