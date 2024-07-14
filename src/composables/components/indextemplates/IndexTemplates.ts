import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { ref, Ref } from 'vue'
import { useConnectionStore } from '../../../store/connection.ts'

export type GenericIndexTemplate = {
  name: string,
  order?: string,
  version?: string,
  priority?: string,
  template?: string,
  index_patterns?: string[],
  indexPatterns?: string,
  index_template?: {
    index_patterns?: string[],
  }
}

type IndexTemplates = {
  index_templates?: Record<string, { index_patterns: string[] }>,
  component_templates?: Record<string, { index_patterns: string[] }>
} | Record<string, { template: string }>

export const useIndexTemplates = () => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<GenericIndexTemplate[] | null> = ref(null)
  const connectionStore = useConnectionStore()

  const load = async () => {
    if (!connectionStore.activeCluster) return
    const majorVersion = parseInt(connectionStore.activeCluster.majorVersion)
    const method = templateEndpoint(majorVersion)
    if (!method) return

    return callElasticsearch(method)
        .then(body => (data.value = enrich(body)))
        .catch(() => (data.value = null))
  }

  return {
    data,
    requestState,
    load
  }
}

const enrich = (data: IndexTemplates) => {
  const templates = data.index_templates || data.component_templates || data
  const results: GenericIndexTemplate[] = []
  Object.entries(templates).map(([name, template]) => {
    const indexPatterns = template.index_patterns?.join('') || template.index_template?.index_patterns?.join('') || template.component_template?.index_patterns?.join('') || template.template
    results.push({
      name,
      indexPatterns,
      ...template,
    })
  })
  return results
}

const templateEndpoint = (majorVersion: number) => {
  switch (majorVersion) {
    case 5:
      return 'templates'
    case 6:
      return 'templates'
    case 7:
      return 'templates'
    case 8:
      return 'indexTemplates'
    default:
      return null
  }
}