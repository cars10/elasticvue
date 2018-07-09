import { normalizeSearchParams } from '@/helpers'
import { DEFAULT_SEARCH_PARAMS } from '@/consts'

describe('helpers/normalizeSearchParams', () => {
  it('has correct default values', () => {
    expect(normalizeSearchParams({})).to.eql(DEFAULT_SEARCH_PARAMS)
  })

  it('returns the correct params when called without arguments', () => {
    expect(normalizeSearchParams()).to.eql(DEFAULT_SEARCH_PARAMS)
  })

  it('normalizes correctly when some params are missing', () => {
    const params = {q: 'query', size: '3'}
    const expected = {
      q: 'query',
      from: DEFAULT_SEARCH_PARAMS.from,
      size: 3,
      _sourceInclude: '',
      index: DEFAULT_SEARCH_PARAMS.index
    }
    expect(normalizeSearchParams(params)).to.eql(expected)
  })

  it('normalizes correctly when all params are given', () => {
    const params = {
      q: 'query',
      from: 5,
      size: 20,
      _sourceInclude: 'col1',
      index: 'myIndex'
    }
    const expected = {
      q: 'query',
      from: 5,
      size: 20,
      _sourceInclude: '',
      index: 'myIndex'
    }
    expect(normalizeSearchParams(params)).to.eql(expected)
  })

  it('normalizes correctly when all params are given with wrong types', () => {
    const params = {
      q: 'query',
      from: '5',
      size: '20',
      _sourceInclude: null,
      index: 'myIndex'
    }
    const expected = {
      q: 'query',
      from: 5,
      size: 20,
      _sourceInclude: '',
      index: 'myIndex'
    }
    expect(normalizeSearchParams(params)).to.eql(expected)
  })
})
