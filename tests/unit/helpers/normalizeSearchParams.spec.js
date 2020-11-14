import { normalizeSearchParams } from '@/helpers'
import { DEFAULT_SEARCH_PARAMS } from '@/consts'

describe('helpers/normalizeSearchParams', () => {
  it('has correct default values', () => {
    expect(normalizeSearchParams({})).toEqual({
      query: { query_string: { query: '*', type: DEFAULT_SEARCH_PARAMS.query_type } },
      from: 0,
      size: 1000,
      index: ''
    })
  })

  it('normalizes correctly when some params are missing', () => {
    const params = { q: 'query', size: '3' }
    const expected = {
      query: { query_string: { query: 'query', type: DEFAULT_SEARCH_PARAMS.query_type } },
      from: DEFAULT_SEARCH_PARAMS.from,
      size: 3,
      index: DEFAULT_SEARCH_PARAMS.index
    }
    expect(normalizeSearchParams(params)).toEqual(expected)
  })

  it('normalizes correctly when all params are given', () => {
    const params = {
      q: 'query',
      from: 5,
      size: 20,
      source: 'col1',
      index: 'myIndex'
    }
    const expected = {
      query: { query_string: { query: 'query', type: DEFAULT_SEARCH_PARAMS.query_type } },
      from: 5,
      size: 20,
      _source: ['col1'],
      index: 'myIndex'
    }
    expect(normalizeSearchParams(params)).toEqual(expected)
  })

  it('normalizes correctly when all params are given with wrong types', () => {
    const params = {
      q: 'query',
      from: '5',
      size: '20',
      source: null,
      index: 'myIndex'
    }
    const expected = {
      query: { query_string: { query: 'query', type: DEFAULT_SEARCH_PARAMS.query_type } },
      from: 5,
      size: 20,
      index: 'myIndex'
    }
    expect(normalizeSearchParams(params)).toEqual(expected)
  })
})
