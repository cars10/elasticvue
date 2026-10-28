import { computed, onMounted, ref, shallowRef } from 'vue'
import { RequestState, useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useIndexTemplatesStore } from '../../../store/indexTemplates.ts'
import { isHiddenIndex } from '../../../helpers/indices.ts'
import { DEFAULT_HIDE_INDICES_REGEX } from '../../../consts.ts'
import {
  parseComponentTemplates,
  parseComposableTemplates,
  parseLegacyTemplates,
  summarizeIndexTemplates,
  TEMPLATE_LIST_PARAMS
} from '../../../helpers/indexTemplates.ts'
import type {
  EsComponentTemplates,
  EsComposableTemplates,
  EsLegacyTemplates,
  IndexTemplate
} from '../../../types/indexTemplates.ts'

const failed = (state: RequestState) => state.apiError || state.networkError

export const useIndexTemplates = () => {
  const indexTemplatesStore = useIndexTemplatesStore()
  const legacy = useElasticsearchAdapter()
  const composable = useElasticsearchAdapter()
  const component = useElasticsearchAdapter()

  const templates = shallowRef<IndexTemplate[]>([])
  const composableSupported = ref(false)

  const requestState = computed<RequestState>(() => {
    const states = [legacy.requestState.value, composable.requestState.value, component.requestState.value]
    return states.find((s) => s.loading) || states.find((s) => !failed(s)) || states[0]
  })

  const visibleTemplates = computed(() =>
    indexTemplatesStore.showHiddenIndices
      ? templates.value
      : templates.value.filter((t) => !isHiddenIndex(t.name, DEFAULT_HIDE_INDICES_REGEX))
  )

  const summary = computed(() => summarizeIndexTemplates(visibleTemplates.value))

  const load = async () => {
    const [legacyResult, composableResult, componentResult] = await Promise.allSettled([
      legacy.callElasticsearch('template', TEMPLATE_LIST_PARAMS.legacy) as Promise<EsLegacyTemplates>,
      composable.callElasticsearch('indexTemplate', TEMPLATE_LIST_PARAMS.composable) as Promise<EsComposableTemplates>,
      component.callElasticsearch('componentTemplate', TEMPLATE_LIST_PARAMS.component) as Promise<EsComponentTemplates>
    ])

    const value = <T>(result: PromiseSettledResult<T>) => (result.status === 'fulfilled' ? result.value : null)
    const composableTemplates = parseComposableTemplates(value(composableResult))

    composableSupported.value = composableResult.status === 'fulfilled'
    templates.value = [
      ...composableTemplates,
      ...parseComponentTemplates(value(componentResult), composableTemplates),
      ...parseLegacyTemplates(value(legacyResult))
    ]
  }

  onMounted(load)

  return {
    indexTemplatesStore,
    requestState,
    templates: visibleTemplates,
    composableSupported,
    summary,
    load
  }
}
