import { flattenObject } from '@/helpers/utilities'

describe('helpers/utilities/flattenObject', () => {
  describe('flattenObject with empty object', () => {
    it('returns empty object for empty object without deep and concatNames', () => {
      expect(flattenObject({})).toEqual({})
    })

    it('returns empty array for empty object with deep and without concatNames', () => {
      expect(flattenObject({}, true)).toEqual({})
    })

    it('returns empty array for empty object with deep concatNames', () => {
      expect(flattenObject({}, true, true)).toEqual({})
    })

    it('returns empty array for empty object without deep and with concatNames', () => {
      expect(flattenObject({}, false, true)).toEqual({})
    })
  })

  describe('utilities/flattenObject without nesting', () => {
    it('returns the already flattened object when called without options', () => {
      const obj = { a: 1, b: 2 }
      expect(flattenObject(obj)).toEqual(obj)
    })

    it('returns the already flattened object when called with deep option', () => {
      const obj = { a: 1, b: 2 }
      expect(flattenObject(obj, true)).toEqual(obj)
    })

    it('returns the already flattened object when called with concat option', () => {
      const obj = { a: 1, b: 2 }
      expect(flattenObject(obj, false, true)).toEqual(obj)
    })

    it('returns the already flattened object when called with deep and concat option', () => {
      const obj = { a: 1, b: 2 }
      expect(flattenObject(obj, true, true)).toEqual(obj)
    })
  })

  describe('utilities/flattenObject with nesting', () => {
    it('returns the flattened object when called without options', () => {
      const obj = { a: 1, b: 2, c: { d: 1 } }
      const flattened = { a: 1, b: 2, d: 1 }
      expect(flattenObject(obj)).toEqual(flattened)
    })

    it('returns the first level flattened object when called without options', () => {
      const obj = { a: 1, b: 2, c: { d: 1, e: { f: 3 } } }
      const flattened = { a: 1, b: 2, d: 1, e: { f: 3 } }
      expect(flattenObject(obj)).toEqual(flattened)
    })

    it('returns the deep flattened object when called with deep', () => {
      const obj = { a: 1, b: 2, c: { d: 1, e: { f: 3 } } }
      const flattened = { a: 1, b: 2, d: 1, f: 3 }
      expect(flattenObject(obj, true)).toEqual(flattened)
    })

    it('returns the concatenated deep flattened object when called with deep and concat', () => {
      const obj = { a: 1, b: 2, c: { d: 1, e: { f: 3 } } }
      const flattened = { a: 1, b: 2, 'c.d': 1, 'c.e.f': 3 }
      expect(flattenObject(obj, true, true)).toEqual(flattened)
    })
  })
})
