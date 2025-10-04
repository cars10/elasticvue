import { describe, it, expect } from 'vitest'
import { cleanRestPath } from '../../../src/helpers/cleanRestPath'

describe.concurrent('helpers/cleanRestPath.ts', () => {
  describe('basic functionality', () => {
    it('should return empty string for empty input', () => {
      expect(cleanRestPath('')).toBe('')
    })

    it('should handle null/undefined input gracefully', () => {
      expect(cleanRestPath(null as unknown as string)).toBe(null)
      expect(cleanRestPath(undefined as unknown as string)).toBe(undefined)
    })

    it('should handle simple index names without slashes', () => {
      const testCases = [
        'movies',
        'kube-2024.12.21',
        'my-index',
        'test_index'
      ]
      testCases.forEach(indexName => {
        expect(cleanRestPath(indexName)).toBe(indexName)
      })
    })
  })

  describe('index name cleaning', () => {
    it('should clean index names with special characters', () => {
      const testCases = [
        {
          input: 'foo/<kube-{now/d}>/_doc',
          expected: 'foo/<kube-{now/d%7D%3E%2F_doc' // The function only cleans the index part, not the rest
        },
        {
          input: 'movies/%/<kube%+>/bar',
          expected: 'movies/%/<kube%+>/bar' // The function only cleans the index part, not the rest
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })
  })

  describe('document ID encoding', () => {
    it('should encode document IDs with slashes', () => {
      const testCases = [
        {
          input: 'my-index/my-cat/document-with-/-char',
          expected: 'my-index/my-cat/document-with-%2F-char'
        },
        {
          input: 'my-index/_doc/document-with-/-char',
          expected: 'my-index/_doc/document-with-%2F-char'
        },
        {
          input: 'test-index/type/doc/with/multiple/slashes',
          expected: 'test-index/type/doc%2Fwith%2Fmultiple%2Fslashes'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should encode document IDs with special characters', () => {
      const testCases = [
        {
          input: 'my-index/type/document with spaces',
          expected: 'my-index/type/document%20with%20spaces'
        },
        {
          input: 'my-index/type/document+with+plus',
          expected: 'my-index/type/document%2Bwith%2Bplus'
        },
        {
          input: 'my-index/type/document:with:colons',
          expected: 'my-index/type/document%3Awith%3Acolons'
        },
        {
          input: 'my-index/type/document?with?question',
          expected: 'my-index/type/document%3Fwith%3Fquestion'
        },
        {
          input: 'my-index/type/document#with#hash',
          expected: 'my-index/type/document%23with%23hash'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should not double-encode already encoded document IDs', () => {
      const testCases = [
        {
          input: 'my-index/my-cat/document-with-%2F-char',
          expected: 'my-index/my-cat/document-with-%2F-char'
        },
        {
          input: 'my-index/type/document%20with%20spaces',
          expected: 'my-index/type/document%20with%20spaces'
        },
        {
          input: 'my-index/type/document%2Bwith%2Bplus',
          expected: 'my-index/type/document%2Bwith%2Bplus'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })
  })

  describe('API endpoints', () => {
    it('should not modify API endpoints', () => {
      const testCases = [
        'my-index/_search',
        'my-index/_mapping',
        'my-index/_settings',
        'my-index/_stats',
        'my-index/_aliases',
        'my-index/_refresh',
        'my-index/_flush',
        'my-index/_forcemerge',
        'my-index/_shrink',
        'my-index/_split',
        'my-index/_clone',
        'my-index/_rollover',
        'my-index/_freeze',
        'my-index/_unfreeze',
        'my-index/_close',
        'my-index/_open',
        'my-index/_reindex',
        'my-index/_update_by_query',
        'my-index/_delete_by_query',
        'my-index/_bulk',
        'my-index/_msearch',
        'my-index/_mget',
        'my-index/_explain',
        'my-index/_validate/query',
        'my-index/_analyze',
        'my-index/_termvectors',
        'my-index/_field_caps',
        'my-index/_search_shards',
        'my-index/_search/template',
        'my-index/_render/template',
        'my-index/_scripts',
        'my-index/_ingest',
        'my-index/_transform',
        'my-index/_ml',
        'my-index/_watcher',
        'my-index/_security',
        'my-index/_xpack',
        'my-index/_cat',
        'my-index/_cluster',
        'my-index/_nodes',
        'my-index/_tasks',
        'my-index/_snapshot',
        'my-index/_repositories',
        'my-index/_ilm',
        'my-index/_slm',
        'my-index/_enrich',
        'my-index/_data_frame',
        'my-index/_rollup',
        'my-index/_transform',
        'my-index/_async_search',
        'my-index/_eql',
        'my-index/_graph',
        'my-index/_license',
        'my-index/_monitoring',
        'my-index/_telemetry',
        'my-index/_usage',
        'my-index/_features',
        'my-index/_info',
        'my-index/_health'
      ]
      testCases.forEach(endpoint => {
        expect(cleanRestPath(endpoint)).toBe(endpoint)
      })
    })
  })

  describe('complex scenarios', () => {
    it('should handle paths with multiple segments', () => {
      const testCases = [
        {
          input: 'my-index/type/doc-id',
          expected: 'my-index/type/doc-id'
        },
        {
          input: 'my-index/type/doc-id/sub-path',
          expected: 'my-index/type/doc-id%2Fsub-path'
        },
        {
          input: 'my-index/type/doc-id/sub-path/another',
          expected: 'my-index/type/doc-id%2Fsub-path%2Fanother'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should handle paths with query parameters', () => {
      const testCases = [
        {
          input: 'my-index/_search?q=test',
          expected: 'my-index/_search%3Fq%3Dtest' // Query parameters are part of the document ID and get encoded
        },
        {
          input: 'my-index/type/doc-id?routing=test',
          expected: 'my-index/type/doc-id%3Frouting%3Dtest' // Query parameters are part of the document ID and get encoded
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should handle paths with fragments', () => {
      const testCases = [
        {
          input: 'my-index/_search#fragment',
          expected: 'my-index/_search%23fragment' // Fragments are part of the document ID and get encoded
        },
        {
          input: 'my-index/type/doc-id#fragment',
          expected: 'my-index/type/doc-id%23fragment' // Fragments are part of the document ID and get encoded
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle paths with only slashes', () => {
      expect(cleanRestPath('/')).toBe('/')
      expect(cleanRestPath('//')).toBe('//')
      expect(cleanRestPath('///')).toBe('//%2F') // The last slash gets encoded as part of the document ID
    })

    it('should handle paths starting with slash', () => {
      const testCases = [
        {
          input: '/my-index',
          expected: '/my-index'
        },
        {
          input: '/my-index/type/doc-id',
          expected: '/my-index/type%2Fdoc-id' // The document ID part gets encoded
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should handle paths ending with slash', () => {
      const testCases = [
        {
          input: 'my-index/',
          expected: 'my-index/'
        },
        {
          input: 'my-index/type/',
          expected: 'my-index/type/'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should handle paths with empty segments', () => {
      const testCases = [
        {
          input: 'my-index//doc-id',
          expected: 'my-index//doc-id' // The empty segment is preserved as-is
        },
        {
          input: 'my-index/type//doc-id',
          expected: 'my-index/type/%2Fdoc-id' // The empty segment gets encoded as %2F
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should handle very long paths', () => {
      const longPath = 'my-index/type/' + 'a'.repeat(1000)
      const result = cleanRestPath(longPath)
      expect(result).toBe(longPath)
    })

    it('should handle paths with unicode characters', () => {
      const testCases = [
        {
          input: 'my-index/type/文档-id',
          expected: 'my-index/type/%E6%96%87%E6%A1%A3-id'
        },
        {
          input: 'my-index/type/документ-id',
          expected: 'my-index/type/%D0%B4%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82-id'
        },
        {
          input: 'my-index/type/文档/with/slashes',
          expected: 'my-index/type/%E6%96%87%E6%A1%A3%2Fwith%2Fslashes'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })
  })

  describe('real-world scenarios', () => {
    it('should handle common Elasticsearch patterns', () => {
      const testCases = [
        {
          input: 'logs-2024.01.01/_doc/1',
          expected: 'logs-2024.01.01/_doc/1'
        },
        {
          input: 'logs-2024.01.01/_doc/1/2/3',
          expected: 'logs-2024.01.01/_doc/1%2F2%2F3'
        },
        {
          input: 'my-index/_doc/document-with-/-char',
          expected: 'my-index/_doc/document-with-%2F-char'
        },
        {
          input: 'my-index/_doc/document-with-/-char/and/more',
          expected: 'my-index/_doc/document-with-%2F-char%2Fand%2Fmore'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should handle Kibana-style paths', () => {
      const testCases = [
        {
          input: '.kibana/_doc/config:7.0.0',
          expected: '.kibana/_doc/config%3A7.0.0'
        },
        {
          input: '.kibana/_doc/index-pattern:logs-*',
          expected: '.kibana/_doc/index-pattern%3Alogs-*' // The * is not encoded as it's not a special character for URL encoding
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })

    it('should handle paths with special Elasticsearch characters', () => {
      const testCases = [
        {
          input: 'my-index/_doc/doc.with.dots',
          expected: 'my-index/_doc/doc.with.dots'
        },
        {
          input: 'my-index/_doc/doc-with-dashes',
          expected: 'my-index/_doc/doc-with-dashes'
        },
        {
          input: 'my-index/_doc/doc_with_underscores',
          expected: 'my-index/_doc/doc_with_underscores'
        },
        {
          input: 'my-index/_doc/doc+with+plus',
          expected: 'my-index/_doc/doc%2Bwith%2Bplus'
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })
  })

  describe('performance and stress tests', () => {
    it('should handle many consecutive slashes', () => {
      const input = 'my-index/type/doc////////id'
      const result = cleanRestPath(input)
      expect(result).toBe('my-index/type/doc%2F%2F%2F%2F%2F%2F%2F%2Fid') // All slashes in the document ID get encoded
    })

    it('should handle mixed encoding scenarios', () => {
      const testCases = [
        {
          input: 'my-index/type/doc%2Fid/more',
          expected: 'my-index/type/doc%2Fid/more' // Already encoded parts are not double-encoded
        },
        {
          input: 'my-index/type/doc%2Fid%2Fmore',
          expected: 'my-index/type/doc%2Fid%2Fmore' // Already encoded parts are not double-encoded
        }
      ]
      testCases.forEach(({ input, expected }) => {
        expect(cleanRestPath(input)).toBe(expected)
      })
    })
  })
})
