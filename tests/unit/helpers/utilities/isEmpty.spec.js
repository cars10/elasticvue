import { isEmpty } from '@/helpers/utilities'

describe('helpers/utilities/isEmpty', () => {
  describe('isEmpty with strings', () => {
    it('returns true on empty string', () => {
      expect(isEmpty('')).toBeTruthy()
    })

    it('returns false on filled string', () => {
      expect(isEmpty('string')).toBeFalsy()
      expect(isEmpty('someSuperDuperMegaLongString!!!!String!!!')).toBeFalsy()
    })

    it('returns false on whitespaced string', () => {
      expect(isEmpty(' ')).toBeFalsy()
    })
  })

  describe('isEmpty with integers', () => {
    it('returns false when called with positive integers', () => {
      expect(isEmpty(1)).toBeFalsy()
      expect(isEmpty(10000000)).toBeFalsy()
    })

    it('returns false when called with negative integers', () => {
      expect(isEmpty(-1)).toBeFalsy()
      expect(isEmpty(-1000000)).toBeFalsy()
    })

    it('returns false when called with zero', () => {
      expect(isEmpty(0)).toBeFalsy()
    })
  })

  describe('isEmpty with booleans', () => {
    it('returns false when called with booleans', () => {
      expect(isEmpty(true)).toBeFalsy()
      expect(isEmpty(false)).toBeFalsy()
    })
  })

  describe('isEmpty with special types', () => {
    it('returns true when called with undefined', () => {
      expect(isEmpty()).toBeTruthy()
      expect(isEmpty(undefined)).toBeTruthy()
    })

    it('returns true then called with null', () => {
      expect(isEmpty(null)).toBeTruthy()
    })
  })

  describe('isEmpty with arrays', () => {
    it('returns true when called with empty array', () => {
      expect(isEmpty([])).toBeTruthy()
    })

    it('returns false when called with non-empty array', () => {
      expect(isEmpty([1, 2])).toBeFalsy()
      expect(isEmpty([1])).toBeFalsy()
      expect(isEmpty([0])).toBeFalsy()
      expect(isEmpty([[0]])).toBeFalsy()
      expect(isEmpty([-5])).toBeFalsy()
      expect(isEmpty([''])).toBeFalsy()
      expect(isEmpty([null])).toBeFalsy()
      expect(isEmpty([undefined])).toBeFalsy()
    })
  })

  describe('isEmpty with objects', () => {
    it('returns true when called with empty object', () => {
      expect(isEmpty({})).toBeTruthy()
    })

    it('returns false when called with filled object', () => {
      expect(isEmpty({ a: '' })).toBeFalsy()
      expect(isEmpty({ a: 1 })).toBeFalsy()
      expect(isEmpty({ a: 0 })).toBeFalsy()
      expect(isEmpty({ a: false })).toBeFalsy()
      expect(isEmpty({ a: null })).toBeFalsy()
      expect(isEmpty({ a: undefined })).toBeFalsy()
      expect(isEmpty({ a: [] })).toBeFalsy()
      expect(isEmpty({ a: {} })).toBeFalsy()
    })
  })
})
