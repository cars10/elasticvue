import { defineStore } from 'pinia'
import { ElasticsearchMethod } from '../services/ElasticsearchAdapter.ts'

type ModalState = {
  show: boolean,
  method: ElasticsearchMethod,
  methodParams: any
}

export const useModalStore = defineStore('modal', {
  state: (): ModalState => ({
    show: false,
    method: 'ping',
    methodParams: null
  }),
  actions: {
    setShow (show: boolean) {
      this.show = show

      if (!show) {
        this.method = 'ping'
        this.methodParams = {}
      }
    },
    setMethod (method: ElasticsearchMethod) {
      this.method = method
    },
    setMethodParams (methodParams: any = null) {
      this.methodParams = methodParams
    }
  }
})
