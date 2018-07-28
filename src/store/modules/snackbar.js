import { truncate } from '../../helpers'

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
      state.text = truncate(props.text, 500) || ''
      state.additionalText = truncate(props.additionalText, 500) || ''
      if (props.timeout) state.timeout = props.timeout
      if (props.color) state.color = props.color
      state.visible = true
    },
    setVisible (state, visible) {
      state.visible = visible
    }
  }
}
