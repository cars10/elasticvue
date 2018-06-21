import { isEmpty } from '@/helpers/utilities'

describe('utilities/isEmpty with strings', () => {
  it('returns true on empty string', () => {
    expect(isEmpty('')).to.be.true
  })

  it('returns false on filled string', () => {
    expect(isEmpty('string')).to.be.false
    expect(isEmpty('someSuperDuperMegaLongString!!!!String!!!')).to.be.false
  })

  it('returns false on whitespaced string', () => {
    expect(isEmpty(' ')).to.be.false
  })
})

describe('utilities/isEmpty with integers', () => {
  it('returns false when called with positive integers', () => {
    expect(isEmpty(1)).to.be.false
    expect(isEmpty(10000000)).to.be.false
  })

  it('returns false when called with negative integers', () => {
    expect(isEmpty(-1)).to.be.false
    expect(isEmpty(-1000000)).to.be.false
  })

  it('returns false when called with zero', () => {
    expect(isEmpty(0)).to.be.false
  })
})

describe('utilities/isEmpty with booleans', () => {
  it('returns false when called with booleans', () => {
    expect(isEmpty(true)).to.be.false
    expect(isEmpty(false)).to.be.false
  })
})

describe('utilities/isEmpty with special types', () => {
  it('returns true when called with undefined', () => {
    expect(isEmpty()).to.be.true
    expect(isEmpty(undefined)).to.be.true
  })

  it('returns true then called with null', () => {
    expect(isEmpty(null)).to.be.true
  })
})

describe('utilities/isEmpty with arrays', () => {
  it('returns true when called with empty array', () => {
    expect(isEmpty([])).to.be.true
    /* eslint-disable no-array-constructor */
    expect(isEmpty(new Array())).to.be.true
  })

  it('returns false when called with non-empty array', () => {
    expect(isEmpty([1, 2])).to.be.false
    expect(isEmpty([1])).to.be.false
    expect(isEmpty([0])).to.be.false
    expect(isEmpty([[0]])).to.be.false
    expect(isEmpty([-5])).to.be.false
    expect(isEmpty([''])).to.be.false
    expect(isEmpty([null])).to.be.false
    expect(isEmpty([undefined])).to.be.false
  })
})

describe('utilities/isEmpty with objects', () => {
  it('returns true when called with empty object', () => {
    expect(isEmpty({})).to.be.true
  })

  it('returns false when called with filled object', () => {
    expect(isEmpty({a: ''})).to.be.false
    expect(isEmpty({a: 1})).to.be.false
    expect(isEmpty({a: 0})).to.be.false
    expect(isEmpty({a: false})).to.be.false
    expect(isEmpty({a: null})).to.be.false
    expect(isEmpty({a: undefined})).to.be.false
    expect(isEmpty({a: []})).to.be.false
    expect(isEmpty({a: {}})).to.be.false
  })
})
