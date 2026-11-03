import { describe, it, expect } from 'vitest'

import { addTrailingSlash } from '../../../src/helpers/elasticsearchAdapter'

describe.concurrent('helpers/elasticsearchAdapter.ts', () => {
  describe.concurrent('elasticsearchAdapter.ts addTrailingSlash', () => {
    it('should not append a / if uri already ends with a /', () => {
      const uri = 'http://localhost:9200/'
      const result = addTrailingSlash(uri)
      expect(result).toBe(uri)
    })

    it('should append a / if uri does not end with a /', () => {
      const uri = 'http://localhost:9200'
      const result = addTrailingSlash(uri)
      expect(result).toBe(uri + '/')
    })
  })
})
