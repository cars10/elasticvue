import { defineStore } from 'pinia'
import { HTTP_METHODS } from '../consts'

export const useRestQueryStore = defineStore('restQuery', {
  state: () => ({
    request: {
      method: HTTP_METHODS[1],
      path: '',
      body: ''
    }
  }),
  persist: true
})
