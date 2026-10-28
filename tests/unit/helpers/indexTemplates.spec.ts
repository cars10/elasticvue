import { describe, expect, it } from 'vitest'
import {
  extractTemplateBody,
  parseComponentTemplates,
  parseComposableTemplates,
  parseLegacyTemplates,
  summarizeIndexTemplates
} from '../../../src/helpers/indexTemplates'

const composable = parseComposableTemplates({
  index_templates: [
    {
      name: 'logs',
      index_template: {
        index_patterns: ['logs-*-*'],
        priority: 100,
        composed_of: ['logs@settings'],
        data_stream: {},
        _meta: { managed: true }
      }
    },
    { name: 'plain', index_template: { index_patterns: 'plain-*' } }
  ]
})

describe('parseLegacyTemplates', () => {
  it('reads index_patterns (ES 6+) and template (ES 1-5)', () => {
    const templates = parseLegacyTemplates({
      modern: { order: 1, index_patterns: ['a-*', 'b-*'] },
      old: { template: 'old-*' }
    })

    expect(templates.map((t) => [t.name, t.type, t.indexPatterns, t.priority])).toEqual([
      ['modern', 'legacy', ['a-*', 'b-*'], 1],
      ['old', 'legacy', ['old-*'], null]
    ])
  })

  it('handles empty responses', () => {
    expect(parseLegacyTemplates(null)).toEqual([])
  })
})

describe('parseComposableTemplates', () => {
  it('normalizes patterns, composition and data streams', () => {
    expect(composable[0]).toMatchObject({
      name: 'logs',
      type: 'composable',
      indexPatterns: ['logs-*-*'],
      priority: 100,
      composedOf: ['logs@settings'],
      dataStream: true,
      managed: true
    })
    expect(composable[1]).toMatchObject({ indexPatterns: ['plain-*'], priority: null, composedOf: [], dataStream: false })
  })
})

describe('parseComponentTemplates', () => {
  it('links components to the templates using them', () => {
    const components = parseComponentTemplates(
      {
        component_templates: [
          { name: 'logs@settings', component_template: {} },
          { name: 'orphan', component_template: {} }
        ]
      },
      composable
    )

    expect(components.map((t) => [t.name, t.usedBy])).toEqual([
      ['logs@settings', ['logs']],
      ['orphan', []]
    ])
  })
})

describe('summarizeIndexTemplates', () => {
  it('counts per type', () => {
    const components = parseComponentTemplates(
      {
        component_templates: [
          { name: 'logs@settings', component_template: {} },
          { name: 'orphan', component_template: {} }
        ]
      },
      composable
    )
    const legacy = parseLegacyTemplates({ old: { template: 'old-*' } })

    expect(summarizeIndexTemplates([...composable, ...components, ...legacy])).toEqual({
      composable: 2,
      legacy: 1,
      component: 2,
      unusedComponents: 1,
      dataStreams: 1
    })
  })
})

describe('extractTemplateBody', () => {
  it('unwraps single template responses per type', () => {
    expect(extractTemplateBody('legacy', 'old', { old: { order: 1 } })).toEqual({ order: 1 })
    expect(
      extractTemplateBody('composable', 'logs', { index_templates: [{ name: 'logs', index_template: { priority: 1 } }] })
    ).toEqual({ priority: 1 })
    expect(
      extractTemplateBody('component', 'c', { component_templates: [{ name: 'c', component_template: { version: 2 } }] })
    ).toEqual({ version: 2 })
    expect(extractTemplateBody('composable', 'missing', {})).toBeNull()
  })
})
