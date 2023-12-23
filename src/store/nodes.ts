import { defineStore } from 'pinia'
import { DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX } from '../consts'

type NodesState = {
  hideAttributesRegex: string
}

export const useNodesStore = defineStore('nodes', {
  state: (): NodesState => ({
    hideAttributesRegex: DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX
  }),
  persist: true
})
