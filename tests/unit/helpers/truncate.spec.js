import { truncate } from '@/helpers'

describe('helpers/trnucate', () => {
  it('returns empty string when called with empty string', () => {
    expect(truncate('')).toEqual('')
  })

  it('returns empty string when called with falsey vlaue', () => {
    expect(truncate()).toEqual('')
    expect(truncate(false)).toEqual('')
    expect(truncate(undefined)).toEqual('')
  })
  it('returns empty string when called with empty string', () => {
    expect(truncate('')).toEqual('')
  })

  it('does not truncate a string if its length is the same as the limit', () => {
    const str = 'a'
    expect(truncate(str, 1)).toEqual(str)
  })

  it('does not truncate a string if its length is below the limit', () => {
    const str = 'a'
    expect(truncate(str, 2)).toEqual(str)
  })

  it('does truncate a string if its length is above the limit', () => {
    const str = 'abc'
    expect(truncate(str, 2)).toEqual('ab ...')
  })

  it('stringifies a non-string value', () => {
    const val = 1
    expect(truncate(val, 2)).toEqual(`${val}`)
  })
})
