export type IndexTemplateType = 'composable' | 'legacy' | 'component'

export type IndexTemplate = {
  name: string
  type: IndexTemplateType
  indexPatterns: string[]
  priority: number | null
  version: number | null
  composedOf: string[]
  usedBy: string[]
  dataStream: boolean
  managed: boolean
}

export type IndexTemplatesSummary = {
  composable: number
  legacy: number
  component: number
  unusedComponents: number
  dataStreams: number
}

type EsTemplateMeta = { _meta?: { managed?: boolean } }

export type EsLegacyTemplates = Record<
  string,
  { order?: number; version?: number; index_patterns?: string[] | string; template?: string }
>

export type EsComposableTemplates = {
  index_templates?: {
    name: string
    index_template: {
      index_patterns?: string[] | string
      priority?: number
      version?: number
      composed_of?: string[]
      data_stream?: object
    } & EsTemplateMeta
  }[]
}

export type EsComponentTemplates = {
  component_templates?: { name: string; component_template: { version?: number } & EsTemplateMeta }[]
}
