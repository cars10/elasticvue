import { capitalize } from '@/helpers'

describe('helpers/capitalize', () => {
  it('throws when called without a string', () => {
    expect(() => capitalize()).to.throw(TypeError)
    expect(() => capitalize(null)).to.throw(TypeError)
    expect(() => capitalize(false)).to.throw(TypeError)
    expect(() => capitalize(true)).to.throw(TypeError)
    expect(() => capitalize(1)).to.throw(TypeError)
    expect(() => capitalize([1])).to.throw(TypeError)
    expect(() => capitalize({a: 1})).to.throw(TypeError)
  })

  it('returns empty string when called with empty string', () => {
    expect(capitalize('')).to.eql('')
  })

  it('correctly capitalizes a word', () => {
    expect(capitalize('string')).to.eql('String')
  })

  it('correctly capitalizes a character', () => {
    expect(capitalize('s')).to.eql('S')
  })
})
