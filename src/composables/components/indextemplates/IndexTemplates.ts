import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { ref, Ref, watch } from 'vue'
import { useConnectionStore } from '../../../store/connection.ts'
import ElasticsearchAdapter from '../../../services/ElasticsearchAdapter.ts'
import { QSelectOption } from 'quasar'

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
  const connectionStore = useConnectionStore()
  const endpoint: Ref<QSelectOption> = ref(defaultTemplateEndpoint(connectionStore.activeCluster?.majorVersion))
  const endpointOptions = [
    { label: '_template', value: 'template' },
    { label: '_index_template', value: 'indexTemplate' }
  ]

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<GenericIndexTemplate[] | null> = ref(null)

  const load = async () => {
    const method = endpoint.value.value
    if (!method) return

    data.value = []

    try {
      const body = await callElasticsearch(method as unknown as keyof ElasticsearchAdapter)
      data.value = enrich(body)
    } catch (error) {
    }
  }

  watch(endpoint, () => (load()))

  return {
    data,
    requestState,
    load,
    endpoint,
    endpointOptions
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

const defaultTemplateEndpoint = (majorVersion: string | undefined): QSelectOption => {
  if (!majorVersion) return { label: '_template', value: 'template' }

  try {
    const version = parseInt(majorVersion)
    if (version >= 8) {
      return { label: '_index_template', value: 'indexTemplate' }
    } else {
      return { label: '_template', value: 'template' }
    }
  } catch (e) {
    return { label: '_template', value: 'template' }
  }
}
