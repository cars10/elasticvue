import { describe, expect, it } from 'vitest'
import { buildDocument, documentInputs, inputKind } from '../../../src/helpers/newDocument'
import { stringifyJson } from '../../../src/helpers/json/stringify'
import type { FieldCatalog } from '../../../src/types/search'

describe('newDocument', () => {
  it('maps field types to input kinds', () => {
    expect(['keyword', 'long', 'boolean', 'date', 'geo_point', undefined].map(inputKind)).toEqual([
      'text',
      'number',
      'boolean',
      'date',
      'json',
      'json'
    ])
  })

  it('lists top level fields without multi fields', () => {
    const field = (name: string, type: string, subField = false) => ({
      name,
      types: [type],
      indices: null,
      partial: false,
      aggregatable: true,
      subField,
      sortField: null
    })
    const catalog: FieldCatalog = {
      title: field('title', 'text'),
      'title.keyword': field('title.keyword', 'keyword', true),
      year: field('year', 'long')
    }
    expect(documentInputs(catalog)).toEqual([
      { name: 'title', type: 'text', kind: 'text' },
      { name: 'year', type: 'long', kind: 'number' }
    ])
  })

  it('builds nested documents and skips empty values', () => {
    const inputs = [
      { name: 'title', kind: 'text' as const },
      { name: 'user.name', kind: 'text' as const },
      { name: 'user.age', kind: 'number' as const },
      { name: 'id', kind: 'number' as const },
      { name: 'loc', kind: 'json' as const },
      { name: 'tag', kind: 'json' as const },
      { name: 'flag', kind: 'boolean' as const },
      { name: 'empty', kind: 'text' as const }
    ]
    const values = {
      title: 'Up',
      'user.name': 'ann',
      'user.age': '3',
      id: '12345678901234567890',
      loc: '{"lat": 1, "lon": 2}',
      tag: 'plain',
      flag: false,
      empty: ''
    }
    expect(stringifyJson(buildDocument(inputs, values))).toBe(
      '{"title":"Up","user":{"name":"ann","age":3},"id":12345678901234567890,"loc":{"lat":1,"lon":2},"tag":"plain","flag":false}'
    )
  })
})
