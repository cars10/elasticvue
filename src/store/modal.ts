import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import { ElasticsearchRequest } from '../services/ElasticsearchAdapter.ts'

type ModalState = {
  show: boolean
  title: string
  details: object | null
  request: ElasticsearchRequest | null
}

export const useModalStore = defineStore('modal', {
  state: (): ModalState => ({
    show: false,
    title: '',
    details: null,
    request: null
  }),
  actions: {
    open(title: string, request: ElasticsearchRequest, details: object | null = null) {
      this.title = title
      this.details = details
      this.request = markRaw(request)
      this.show = true
    },
    setShow(show: boolean) {
      if (show) this.show = true
      else this.$reset()
    }
  }
})
