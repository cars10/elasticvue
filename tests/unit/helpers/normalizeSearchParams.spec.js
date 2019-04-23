import { normalizeSearchParams } from '@/helpers'
import { DEFAULT_SEARCH_PARAMS } from '@/consts'

describe('helpers/normalizeSearchParams', () => {
  it('has correct default values', () => {
    expect(normalizeSearchParams({})).toEqual(DEFAULT_SEARCH_PARAMS)
  })

  it('returns the correct params when called without arguments', () => {
    expect(normalizeSearchParams()).toEqual(DEFAULT_SEARCH_PARAMS)
  })

  it('normalizes correctly when some params are missing', () => {
    const params = { q: 'query', size: '3' }
    const expected = {
      q: 'query',
      from: DEFAULT_SEARCH_PARAMS.from,
      size: 3,
      source: '',
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
      q: 'query',
      from: 5,
      size: 20,
      source: '',
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
      q: 'query',
      from: 5,
      size: 20,
      source: '',
      index: 'myIndex'
    }
    expect(normalizeSearchParams(params)).toEqual(expected)
  })
})
