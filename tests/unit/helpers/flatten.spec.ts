import { describe, it, expect } from 'vitest'

import { flattenObj } from '../../../src/helpers/flatten'

describe.concurrent('helpers/flatten.ts', () => {
  describe.concurrent('flatten.ts flattenObj', () => {
    it('should flatten all root objects to dot notation', () => {
      const obj = {
        a: 1,
        b: {
            c: {
                d: 2,
            }
        },
        e: [3, 4, { f: { g: 5 } }],
        h: { 
            i: 6
        }
      }

      expect(flattenObj(obj)).toStrictEqual({
        a: 1,
        'b.c.d': 2,
        e: [3, 4, { f: { g: 5 } }],
        'h.i': 6
      })
    })

    it('should throw a RangeError when input object contains a circular reference', () => {
        const obj = {
          a: 1
        }

        obj['b'] = obj

        expect(() => flattenObj(obj)).toThrowError(RangeError)
      })
  
      it('should flatten null to an empty object', () => {
      expect(flattenObj(null)).toStrictEqual({})
    })

    it('should flatten undefined to an empty object', () => {
        expect(flattenObj(undefined)).toStrictEqual({})
    })

    it('should flatten number to an empty object', () => {
        expect(flattenObj(17)).toStrictEqual({})
    })

    it('should flatten boolean to an empty object', () => {
        expect(flattenObj(true)).toStrictEqual({})
    })

    it('should flatten array to an index+character object', () => {
        expect(flattenObj(['a', 'b'])).toStrictEqual({
            0: 'a',
            1: 'b'
        })
    })

    it('should flatten string to index+character object', () => {
        expect(flattenObj('asdf')).toStrictEqual({
            0: 'a',
            1: 's',
            2: 'd',
            3: 'f'
        })
    })
  })
})