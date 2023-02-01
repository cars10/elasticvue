import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
  state: () => ({
    visible: false,
    timeout: -1,
    color: null,
    title: '',
    body: '',
    copyableText: '',
    id: null
  }),
  actions: {
    show (props) {
      this.visible = false
      this.timeout = -1
      this.color = null
      this.copyableText = ''

      this.title = props.title || ''
      this.body = props.body || ''
      if (props.timeout) this.timeout = props.timeout
      if (props.color) this.color = props.color
      if (props.copyableText) this.copyableText = props.copyableText

      this.id = Date.now()
      this.visible = true
    },
    setVisible (state, visible) {
      this.visible = visible
    }
  }
})
