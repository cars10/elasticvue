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

type Snapshot ={
  id: string,
  status: string,
  start_time: string,
  start_epoch: string,
  end_time: string,
  end_epoch: string,
  duration: string,
  successful_shards: number,
  failed_shards: number,
  total_shards: number,
  indices: number
}