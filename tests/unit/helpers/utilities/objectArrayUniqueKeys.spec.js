import { objectArrayUniqueKeys } from '@/helpers/utilities'

describe('helpers/utilities/objectArrayUniqueKeys', () => {
  it('returns an empty array when called empty', () => {
    expect(objectArrayUniqueKeys()).toEqual([])
    expect(objectArrayUniqueKeys().length).toEqual(0)
  })

  it('returns an empty array when called with an empty array', () => {
    expect(objectArrayUniqueKeys([])).toEqual([])
    expect(objectArrayUniqueKeys().length).toEqual(0)
  })

  it('returns all keys when called with single object and unique keys', () => {
    const myObject = {a: 1, b: 2}
    const myKeys = Object.keys(myObject)

    expect(objectArrayUniqueKeys([myObject])).toEqual(expect.arrayContaining(myKeys))
  })

  it('returns all keys unique when called with multiple objects', () => {
    const myObjects = [
      {a: 1, b: 2},
      {b: 3, c: 4},
      {c: 5, a: 6},
      {'asd:qwe': 7},
      {'b.a': 7}
    ]

    expect(objectArrayUniqueKeys(myObjects)).toEqual(expect.arrayContaining(['a', 'b', 'c', 'asd:qwe', 'b.a']))
  })

  it('only returns the keys of objects on the first level', () => {
    const myObjects = [
      {a: 1, b: {c: 3, d: 4, f: {e: 5}}},
      {d: 1}
    ]

    expect(objectArrayUniqueKeys(myObjects)).toEqual(expect.arrayContaining(['a', 'b', 'd']))
    expect(objectArrayUniqueKeys(myObjects)).not.toEqual(expect.arrayContaining(['c', 'f', 'e']))
  })

  it('returns one level nested keys when called with key argument', () => {
    const myObjects = [
      {a: 1, b: {c: 3, d: 4, f: {e: 5}}},
      {d: 1, b: {qwe: 3, c: 1}}
    ]

    expect(objectArrayUniqueKeys(myObjects, 'b')).toEqual(expect.arrayContaining(['c', 'd', 'f', 'qwe']))
    expect(objectArrayUniqueKeys(myObjects, 'b')).not.toEqual(expect.arrayContaining(['a', 'b', 'e']))
  })
})
