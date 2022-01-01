export const snackbar = {
  namespaced: true,
  state: {
    visible: false,
    timeout: -1,
    color: null,
    title: '',
    body: '',
    copyableText: ''
  },
  mutations: {
    show (state, props) {
      state.timeout = -1
      state.color = null
      state.copyableText = ''

      setTimeout(() => {
        state.title = props.title || ''
        state.body = props.body || ''
        if (props.timeout) state.timeout = props.timeout
        if (props.color) state.color = props.color
        if (props.copyableText) state.copyableText = props.copyableText
        state.visible = true
      }, 0)
    },
    setVisible (state, visible) {
      state.visible = visible
    }
  }
}
