import { buildQueryFromTableOptions } from '@/helpers/search'

const DEFAULT_TABLE_OPTIONS = {
  'page': 1,
  'itemsPerPage': 10,
  'sortBy': [],
  'sortDesc': [],
  'groupBy': [],
  'groupDesc': [],
  'mustSort': false,
  'multiSort': false,
  'sortByDesc': []
}

const a = {
  'page': 1,
  'itemsPerPage': 10,
  'sortBy': [
    'owner_type'
  ],
  'sortDesc': [
    true
  ],
  'groupBy': [],
  'groupDesc': [],
  'mustSort': false,
  'multiSort': false,
  'sortByDesc': []
}

describe('helpers/search.js', () => {
  describe('buildQueryFromTableOptions', () => {
    it('returns empty object when new options are missing', () => {
      expect(buildQueryFromTableOptions(null)).toEqual({})
      expect(buildQueryFromTableOptions(undefined)).toEqual({})
    })

    it('returns empty object when new and old are empty', () => {
      const query = buildQueryFromTableOptions({}, {})
      expect(query).toEqual({})
    })

    it('returns empty object when new and old are equal', () => {
      const query = buildQueryFromTableOptions(DEFAULT_TABLE_OPTIONS, DEFAULT_TABLE_OPTIONS)
      expect(query).toEqual({})
    })

    it('correctly calculates from and size for first page', () => {
      const query = buildQueryFromTableOptions({ page: 1, itemsPerPage: 5 }, {})
      expect(query).toEqual({ from: 0, size: 5, sort: [] })
    })

    it('correctly calculates from and size for second page', () => {
      const query = buildQueryFromTableOptions({ page: 2, itemsPerPage: 5 }, {})
      expect(query).toEqual({ from: 5, size: 5, sort: [] })
    })

    it('correctly sets the order', () => {
      const query = buildQueryFromTableOptions({ page: 2, itemsPerPage: 5, sortDesc: [true], sortBy: ['name'] }, {})
      expect(query).toEqual({ from: 5, size: 5, sort: [{ name: { unmapped_type: 'keyword', order: 'desc' } }] })
    })
  })
})
