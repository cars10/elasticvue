import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { ref, Ref } from 'vue'
import { useConnectionStore } from '../../../store/connection.ts'
import ElasticsearchAdapter from '../../../services/ElasticsearchAdapter.ts'

export type GenericIndexTemplate = {
  name: string,
  endpoint: string,
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
    const method = templateEndpoints(majorVersion)
    if (!method) return

    data.value = []

    for (const m of method) {
      try {
        const body = await callElasticsearch(m as unknown as keyof ElasticsearchAdapter)
        data.value = data.value.concat(enrich(body, m))
      } catch (error) {
      }
    }
  }

  return {
    data,
    requestState,
    load
  }
}

const enrich = (data: IndexTemplates, endpoint: string) => {
  const templates = data.index_templates || data.component_templates || data
  const results: GenericIndexTemplate[] = []
  Object.entries(templates).map(([name, template]) => {
    const indexPatterns = template.index_patterns?.join('') || template.index_template?.index_patterns?.join('') || template.component_template?.index_patterns?.join('') || template.template
    results.push({
      name,
      endpoint: convertToSnakeCase(endpoint),
      indexPatterns,
      ...template,
    })
  })
  return results
}

const templateEndpoints = (majorVersion: number) => {
  switch (majorVersion) {
    case 5:
      return ['template']
    case 6:
      return ['template']
    case 7:
      return ['template', 'indexTemplate']
    case 8:
      return ['template', 'indexTemplate']
    default:
      return null
  }
}

const convertToSnakeCase = (input: string) => {
  return input.replace(/([A-Z])/g, '_$1').replace(/^/, '_').toLowerCase()
}