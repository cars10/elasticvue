import { describe, expect, it } from 'vitest'
import { parseJson } from '../../../src/helpers/json/parse'
import { stringifyJson } from '../../../src/helpers/json/stringify'
import { beautify } from '../../../src/helpers/beautify'
import { compareValues, flattenDocument, formatFieldValue, getFieldValue } from '../../../src/helpers/search/documentValues'
import { catalogFromFieldCaps, catalogFromMappings } from '../../../src/helpers/search/fieldCatalog'

describe('parseJson', () => {
  it('keeps integers beyond Number.MAX_SAFE_INTEGER as bigint', () => {
    const parsed = parseJson('{"a":74897271582524117,"b":-9007199254740993,"c":18446744073709551615}')
    expect(parsed).toEqual({ a: 74897271582524117n, b: -9007199254740993n, c: 18446744073709551615n })
  })

  it('keeps safe integers and floats as numbers', () => {
    const parsed = parseJson(
      '{"max":9007199254740991,"neg":-123456789012345,"pct":83.33333333333334,"long":0.1234567890123456,"exp":1e21,"big":1}'
    )
    expect(parsed).toEqual({
      max: 9007199254740991,
      neg: -123456789012345,
      pct: 83.33333333333334,
      long: 0.1234567890123456,
      exp: 1e21,
      big: 1
    })
    Object.values(parsed).forEach((value) => expect(typeof value).toBe('number'))
  })

  it('keeps numbers as numbers when the response also contains a big integer', () => {
    const parsed = parseJson('{"id":74897271582524117,"pct":83.33333333333334,"n":5}')
    expect(typeof parsed.pct).toBe('number')
    expect(typeof parsed.n).toBe('number')
  })

  it('does not convert long digit runs inside strings', () => {
    expect(parseJson('{"id":"74897271582524117"}')).toEqual({ id: '74897271582524117' })
  })

  it('reads field names like constructor and __proto__ as plain keys', () => {
    for (const text of [
      '{"constructor":1,"project_constructor":2,"__proto__":{"polluted":true}}',
      '{"constructor":74897271582524117,"__proto__":{"polluted":true}}'
    ]) {
      const parsed = parseJson(text)
      expect(Object.keys(parsed)).toEqual([
        'constructor',
        ...(text.includes('project_') ? ['project_constructor'] : []),
        '__proto__'
      ])
      expect(Object.getPrototypeOf(parsed)).toBe(Object.prototype)
      expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    }
  })

  it('strips comments', () => {
    expect(parseJson('{\n// comment\n"a": 74897271582524117 /* id */\n}')).toEqual({ a: 74897271582524117n })
  })

  it('keeps urls and comment markers inside strings', () => {
    expect(parseJson('{"url":"http://x/*y*/","id":74897271582524117}')).toEqual({
      url: 'http://x/*y*/',
      id: 74897271582524117n
    })
  })

  it('keeps the last value of duplicate keys', () => {
    expect(parseJson('{"a":1,"a":2}')).toEqual({ a: 2 })
    expect(parseJson('{"a":74897271582524117,"a":2}')).toEqual({ a: 2 })
  })

  it('throws on invalid json', () => {
    expect(() => parseJson('{"a":')).toThrow()
    expect(() => parseJson('{"a":74897271582524117')).toThrow()
  })
})

describe('stringifyJson', () => {
  it('writes bigints and floats back without losing precision', () => {
    const text = '{"id":74897271582524117,"ids":[18446744073709551615,-9007199254740993],"pct":83.33333333333334,"n":null}'
    expect(stringifyJson(parseJson(text))).toBe(text)
  })

  it('indents', () => {
    expect(stringifyJson({ a: 74897271582524117n }, null, 2)).toBe('{\n  "a": 74897271582524117\n}')
  })

  it('beautifies big numbers without changing them', () => {
    expect(beautify('{"id":74897271582524117}')).toBe('{\n  "id": 74897271582524117\n}')
  })
})

describe('formatFieldValue', () => {
  it('formats bigints and objects containing bigints', () => {
    expect(formatFieldValue(74897271582524117n)).toBe('74897271582524117')
    expect(formatFieldValue({ id: 74897271582524117n })).toBe('{"id":74897271582524117}')
    expect(formatFieldValue([74897271582524117n, 1])).toBe('[74897271582524117,1]')
  })
})

describe('compareValues', () => {
  it('sorts numbers and bigints numerically', () => {
    const values = [74897271582524117n, 5, 9007199254740993n, -9007199254740993n, 83.5, 10]
    expect(values.sort(compareValues)).toEqual([-9007199254740993n, 5, 10, 83.5, 9007199254740993n, 74897271582524117n])
  })

  it('sorts strings naturally', () => {
    expect(['b10', 'b9', 'a'].sort(compareValues)).toEqual(['a', 'b9', 'b10'])
  })
})

describe('fields named like Object.prototype members', () => {
  const doc = parseJson('{"constructor":1,"__proto__":{"polluted":true},"a":{"toString":"x"}}')

  it('reads them as plain fields', () => {
    expect(getFieldValue(doc, 'constructor')).toBe(1)
    expect(getFieldValue(doc, '__proto__.polluted')).toBe(true)
    expect(getFieldValue(doc, 'a.toString')).toBe('x')
    expect(Object.keys(flattenDocument(doc))).toEqual(['constructor', '__proto__.polluted', 'a.toString'])
  })

  it('does not find them on documents without these fields', () => {
    expect(getFieldValue({ a: 1 }, 'constructor')).toBeUndefined()
    expect(getFieldValue({ a: 1 }, 'a.toString')).toBeUndefined()
  })

  it('keeps them in the field catalog', () => {
    const caps = parseJson(
      '{"indices":["i"],"fields":{"constructor":{"long":{"type":"long","searchable":true,"aggregatable":true}},' +
        '"__proto__":{"boolean":{"type":"boolean","searchable":true,"aggregatable":true}}}}'
    )
    const fromCaps = catalogFromFieldCaps(caps)
    expect(Object.keys(fromCaps)).toEqual(['constructor'])
    expect(fromCaps.constructor.types).toEqual(['long'])
    expect(catalogFromFieldCaps({ indices: ['i'], fields: {} }).constructor).toBeUndefined()

    const fromMappings = catalogFromMappings({ i: { mappings: { properties: { constructor: { type: 'long' } } } } })
    expect(fromMappings.constructor.types).toEqual(['long'])
  })
})
