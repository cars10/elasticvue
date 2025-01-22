import { defineStore } from 'pinia'
import { DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX } from '../consts'

type NodesState = {
  filter: string
  hideAttributesRegex: string
}

export const useNodesStore = defineStore('nodes', {
  state: (): NodesState => ({
    filter: '',
    hideAttributesRegex: DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX
  }),
  persist: true
})
