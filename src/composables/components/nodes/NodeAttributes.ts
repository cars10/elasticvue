import { useNodesStore } from '../../../store/nodes.ts'
import { computed } from 'vue'

export type NodeAttributesProps = {
  attributes: Record<string, string>
}

export const useNodeAttributes = (props: NodeAttributesProps) => {
  const nodesStore = useNodesStore()

  const parseRegex = () => {
    const trimmed = nodesStore.hideAttributesRegex.trim()
    if (trimmed.length === 0) return false

    try {
      return new RegExp(trimmed)
    } catch (_e) {
      console.error('invalid regex:', nodesStore.hideAttributesRegex)
      return false
    }
  }

  const regex = parseRegex()
  const filtered = computed(() => {
    if (!regex) return props.attributes

    return Object.keys(props.attributes)
        .filter(attribute => !attribute.match(regex))
        .reduce((obj: Record<string, string>, key: string) => {
          obj[key] = props.attributes[key]
          return obj
        }, {})
  })

  return {
    filtered
  }
}