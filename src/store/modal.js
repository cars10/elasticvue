import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    show: false,
    method: '',
    methodParams: {}
  }),
  actions: {
    setShow (show) {
      this.show = show

      if (!show) {
        this.method = ''
        this.methodParams = {}
      }
    },
    setMethod (method) {
      this.method = method
    },
    setMethodParams (methodParams) {
      this.methodParams = methodParams
    }
  }
})
