import { useModalStore } from '../store/modal'

export const useModal = () => {
  const store = useModalStore()

  const openModalWith = (method, methodParams) => {
    store.setMethod(method)
    store.setMethodParams(methodParams)
    store.setShow(true)
  }

  return {
    openModalWith
  }
}