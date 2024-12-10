import { describe, it, expect } from 'vitest'

import { buildFetchAuthHeader, addTrailingSlash, uriWithCredentials } from '../../../src/helpers/elasticsearchAdapter'

describe.concurrent('helpers/elasticsearchAdapter.ts', () => {
  describe.concurrent('elasticsearchAdapter.ts buildFetchAuthHeader', () => {
    it('should base64-encode username and password when both are non-zero length', () => {
      const result = buildFetchAuthHeader('username', 'password')

      const [schema, encoded] = result.split(' ')

      expect(schema).toBe('Basic')
      expect(decodeURIComponent(escape(atob(encoded))).split(':')).toEqual(['username', 'password'])
    })

    it('should base64-encode only username when non-zero length and password is zero-length', () => {
      const result = buildFetchAuthHeader('username', '')

      const [schema, encoded] = result.split(' ')

      expect(schema).toBe('Basic')
      expect(decodeURIComponent(escape(atob(encoded)))).toEqual('username')
    })

    it('should return ApiKey schema and plaintext password when username is zero-length and password is non-zero length', () => {
      const result = buildFetchAuthHeader('', 'password')

      const [schema, apiKey] = result.split(' ')

      expect(schema).toBe('ApiKey')
      expect(apiKey).toBe('password')
    })

    it('should return empty string when both username and password are zero-length', () => {
      const result = buildFetchAuthHeader('', '')

      expect(result).toBe('')
    })
  })

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

  describe.concurrent('elasticsearchAdapter.ts uriWithCredentials', () => {
    it('should stringify URI with username and password when username is non-zero length', () => {
      const uri = 'http://localhost:9200/'
      const result = uriWithCredentials(uri, 'username', 'password')
      expect(result).toBe('http://username:password@localhost:9200/')
    })

    it('should not stringify URI with username and password when username is zero length', () => {
      const uri = 'http://localhost:9200/'
      const result = uriWithCredentials(uri, '', 'password')
      expect(result).toBe(uri)
    })

    it('should replace embedded username and password when new username is non-zero length', () => {
      const uri = 'http://original_username:original_password@localhost:9200/'
      const result = uriWithCredentials(uri, 'username', 'password')
      expect(result).toBe('http://username:password@localhost:9200/')
    })

    it('should replace username and retain password when new username is zero length', () => {
      const uri = 'http://original_username:original_password@localhost:9200/'
      const result = uriWithCredentials(uri, '', 'password')
      expect(result).toBe('http://:original_password@localhost:9200/')
    })
  })
})