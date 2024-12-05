import { describe, it, expect } from 'vitest'

import { beautify } from '../../../src/helpers/beautify'

describe.concurrent('helpers/elasticsearchAdapter.ts', () => {
  describe.concurrent('beautify.ts beautify', () => {
    it('should return empty string when supplied with empty string', () => {
      expect(beautify('')).toBe('')
    })

    it('should return undefined when supplied with undefined', () => {
      expect(beautify(undefined as unknown as string)).toBe(undefined)
    })

    it('should return null when supplied with null', () => {
      expect(beautify(null as unknown as string)).toBe(null)
    })

    it('should return false when supplied with false', () => {
      expect(beautify(false as unknown as string)).toBe(false)
    })

    it('should return 0 when supplied with 0', () => {
      expect(beautify(0 as unknown as string)).toBe(0)
    })

    it('should return empty string when supplied with empty string', () => {
      const text = '{"a":123456789012345678901234567890}'

      const normalJSONStrinigified = JSON.stringify(JSON.parse(text))

      expect(normalJSONStrinigified).toBe('{"a":1.2345678901234568e+29}')

      expect(beautify(text)).toBe('{\n  "a": 1.2345678901234567890123456789e+29\n}')
    })

    it('should return the input string if not parseable as JSON', () => {
      const text = 'this { is not } json'

      expect(beautify(text)).toBe(text)
    })
  })
})