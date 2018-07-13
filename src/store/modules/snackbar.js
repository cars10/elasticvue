export const snackbar = {
  namespaced: true,
  state: {
    visible: false,
    timeout: 6000,
    color: null,
    text: '',
    additionalText: ''
  },
  mutations: {
    show (state, props) {
      state.text = props.text || ''
      state.additionalText = props.additionalText || ''
      if (props.timeout) state.timeout = props.timeout
      if (props.color) state.color = props.color
      state.visible = true
    },
    setVisible (state, visible) {
      state.visible = visible
    }
  }
}
