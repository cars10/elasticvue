import { useModalStore } from '../store/modal'
import { ElasticsearchMethod } from '../services/ElasticsearchAdapter.ts'

export const useModal = () => {
  const store = useModalStore()

  const openModalWith = (method: ElasticsearchMethod, methodParams?: object) => {
    store.setMethod(method)
    store.setMethodParams(methodParams)
    store.setShow(true)
  }

  return {
    openModalWith
  }
}
