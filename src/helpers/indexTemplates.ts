import type {
  EsComponentTemplates,
  EsComposableTemplates,
  EsLegacyTemplates,
  IndexTemplate,
  IndexTemplatesSummary,
  IndexTemplateType
} from '../types/indexTemplates.ts'

export const TEMPLATE_METHODS = {
  legacy: 'template',
  composable: 'indexTemplate',
  component: 'componentTemplate'
} as const

export const TEMPLATE_LIST_PARAMS: Record<IndexTemplateType, { filter_path: string }> = {
  legacy: { filter_path: '*.order,*.version,*.index_patterns,*.template' },
  composable: { filter_path: '-index_templates.index_template.template' },
  component: { filter_path: '-component_templates.component_template.template' }
}

export const extractTemplateBody = (type: IndexTemplateType, name: string, body: any): object | null => {
  if (type === 'legacy') return body?.[name] ?? null
  if (type === 'composable') return body?.index_templates?.[0]?.index_template ?? null
  return body?.component_templates?.[0]?.component_template ?? null
}

const toArray = (value?: string[] | string) => (value === undefined ? [] : [value].flat())

export const parseLegacyTemplates = (body: EsLegacyTemplates | null): IndexTemplate[] =>
  Object.entries(body || {}).map(([name, template]) => ({
    name,
    type: 'legacy',
    indexPatterns: toArray(template.index_patterns ?? template.template),
    priority: template.order ?? null,
    version: template.version ?? null,
    composedOf: [],
    usedBy: [],
    dataStream: false,
    managed: false
  }))

export const parseComposableTemplates = (body: EsComposableTemplates | null): IndexTemplate[] =>
  (body?.index_templates || []).map(({ name, index_template: template }) => ({
    name,
    type: 'composable',
    indexPatterns: toArray(template.index_patterns),
    priority: template.priority ?? null,
    version: template.version ?? null,
    composedOf: template.composed_of || [],
    usedBy: [],
    dataStream: !!template.data_stream,
    managed: template._meta?.managed === true
  }))

export const parseComponentTemplates = (body: EsComponentTemplates | null, composable: IndexTemplate[]): IndexTemplate[] =>
  (body?.component_templates || []).map(({ name, component_template: template }) => ({
    name,
    type: 'component',
    indexPatterns: [],
    priority: null,
    version: template.version ?? null,
    composedOf: [],
    usedBy: composable.filter((t) => t.composedOf.includes(name)).map((t) => t.name),
    dataStream: false,
    managed: template._meta?.managed === true
  }))

export const summarizeIndexTemplates = (templates: IndexTemplate[]): IndexTemplatesSummary => {
  const ofType = (type: IndexTemplate['type']) => templates.filter((t) => t.type === type)
  const components = ofType('component')

  return {
    composable: ofType('composable').length,
    legacy: ofType('legacy').length,
    component: components.length,
    unusedComponents: components.filter((t) => !t.usedBy.length).length,
    dataStreams: templates.filter((t) => t.dataStream).length
  }
}
