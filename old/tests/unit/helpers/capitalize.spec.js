import { capitalize } from '@/helpers'

describe('helpers/capitalize', () => {
  it('throws when called without a string', () => {
    expect(() => capitalize()).toThrow(TypeError)
    expect(() => capitalize(null)).toThrow(TypeError)
    expect(() => capitalize(false)).toThrow(TypeError)
    expect(() => capitalize(true)).toThrow(TypeError)
    expect(() => capitalize(1)).toThrow(TypeError)
    expect(() => capitalize([1])).toThrow(TypeError)
    expect(() => capitalize({ a: 1 })).toThrow(TypeError)
  })

  it('returns empty string when called with empty string', () => {
    expect(capitalize('')).toEqual('')
  })

  it('correctly capitalizes a word', () => {
    expect(capitalize('string')).toEqual('String')
  })

  it('correctly capitalizes a character', () => {
    expect(capitalize('s')).toEqual('S')
  })
})
