import { truncate } from '@/helpers'

describe('helpers/trnucate', () => {
  it('returns empty string when called with empty string', () => {
    expect(truncate('')).to.eql('')
  })

  it('returns empty string when called with falsey vlaue', () => {
    expect(truncate()).to.eql('')
    expect(truncate(false)).to.eql('')
    expect(truncate(undefined)).to.eql('')
  })
  it('returns empty string when called with empty string', () => {
    expect(truncate('')).to.eql('')
  })

  it('does not truncate a string if its length is the same as the limit', () => {
    const str = 'a'
    expect(truncate(str, 1)).to.eql(str)
  })

  it('does not truncate a string if its length is below the limit', () => {
    const str = 'a'
    expect(truncate(str, 2)).to.eql(str)
  })

  it('does truncate a string if its length is above the limit', () => {
    const str = 'abc'
    expect(truncate(str, 2)).to.eql('ab ...')
  })

  it('stringifies a non-string value', () => {
    const val = 1
    expect(truncate(val, 2)).to.eql(`${val}`)
  })
})
