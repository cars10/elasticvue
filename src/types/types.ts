type IndexTemplates = {
  index_templates: IndexTemplate[]
}

type IndexTemplate = {
  name: string,
  index_template: IndexTemplateSettings
}

type IndexTemplateSettings = {
  index_patterns: string[],
  priority: number,
  version: number,
  allow_auto_create?: boolean,
  template: object
}

type Index = {
  index: string
}