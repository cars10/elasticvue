import { describe, expect, it } from 'vitest'
import { catalogFromFieldCaps, catalogFromMappings, unmappedTypeFor } from '../../../src/helpers/search/fieldCatalog'
import { elasticsearchCompatibleVersion } from '../../../src/helpers/minClusterVersion'

describe('catalogFromFieldCaps', () => {
  const catalog = catalogFromFieldCaps({
    indices: ['movies', 'recipes'],
    fields: {
      _id: { _id: { type: '_id', aggregatable: true } },
      title: { text: { type: 'text', aggregatable: false } },
      'title.keyword': { keyword: { type: 'keyword', aggregatable: true } },
      year: {
        long: { type: 'long', aggregatable: true, indices: ['movies'] },
        unmapped: { type: 'unmapped', indices: ['recipes'] }
      },
      rating: {
        long: { type: 'long', aggregatable: true, indices: ['movies'] },
        keyword: { type: 'keyword', aggregatable: true, indices: ['recipes'] }
      },
      author: { object: { type: 'object' } },
      'author.name': { keyword: { type: 'keyword', aggregatable: true } }
    }
  })

  it('skips meta and object fields', () => {
    expect(Object.keys(catalog).sort()).toEqual(['author.name', 'rating', 'title', 'title.keyword', 'year'])
  })

  it('marks fields that only exist in some indices', () => {
    expect(catalog.year).toMatchObject({ partial: true, indices: 1, types: ['long'], sortField: 'year' })
    expect(catalog.title).toMatchObject({ partial: false, indices: null })
  })

  it('sorts text fields by their keyword subfield and marks it as sub field', () => {
    expect(catalog.title.sortField).toBe('title.keyword')
    expect(catalog['title.keyword'].subField).toBe(true)
    expect(catalog['author.name'].subField).toBe(false)
  })

  it('falls back to other sortable subfields', () => {
    const withRaw = catalogFromFieldCaps({
      fields: {
        name: { text: { type: 'text', aggregatable: false } },
        'name.raw': { keyword: { type: 'keyword', aggregatable: true } }
      }
    })
    expect(withRaw.name.sortField).toBe('name.raw')
  })

  it('does not sort fields with conflicting types', () => {
    expect(catalog.rating).toMatchObject({ types: ['long', 'keyword'], sortField: null })
  })
})

describe('catalogFromMappings', () => {
  it('reads typed (ES < 7) and typeless mappings, subfields and nested objects', () => {
    const catalog = catalogFromMappings({
      old: {
        mappings: {
          doc: { properties: { name: { type: 'string', fields: { raw: { type: 'string', index: 'not_analyzed' } } } } }
        }
      },
      new: { mappings: { properties: { name: { type: 'keyword' }, user: { properties: { id: { type: 'long' } } } } } }
    })

    expect(catalog.name).toMatchObject({
      types: ['string', 'keyword'],
      partial: false,
      sortField: 'name.raw'
    })
    expect(catalog['name.raw']).toMatchObject({ types: ['string'], aggregatable: true, partial: true, indices: 1 })
    expect(catalog['user.id']).toMatchObject({ types: ['long'], partial: true, sortField: 'user.id' })
  })
})

describe('unmappedTypeFor', () => {
  it('uses string for keyword/text on elasticsearch < 5', () => {
    expect(
      unmappedTypeFor({ name: 'a', types: ['keyword'], indices: null, partial: false, aggregatable: true, sortField: 'a' }, 2)
    ).toBe('string')
    expect(
      unmappedTypeFor({ name: 'a', types: ['long'], indices: null, partial: false, aggregatable: true, sortField: 'a' }, 8)
    ).toBe('long')
    expect(unmappedTypeFor(undefined, 8)).toBeUndefined()
  })
})

describe('elasticsearchCompatibleVersion', () => {
  it('maps opensearch to the elasticsearch version it forked from', () => {
    expect(elasticsearchCompatibleVersion('2.12.0', false)).toBe('7.10.2')
    expect(elasticsearchCompatibleVersion('8.15.0', true)).toBe('8.15.0')
    expect(elasticsearchCompatibleVersion(undefined, true)).toBe('')
  })
})
