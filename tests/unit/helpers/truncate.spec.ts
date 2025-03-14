import { describe, it, expect } from 'vitest'

import { truncateString } from '../../../src/helpers/truncate'

describe.concurrent('helpers/truncateString', () => {
  describe.concurrent('truncateString function', () => {
    it('should return the original string if it is shorter than the max length', () => {
      const input = 'Hello, World!'
      const maxLength = 20
      const result = truncateString(input, maxLength)
      expect(result).toEqual(input)
    })

    it('should truncate the string and add the suffix if it exceeds the max length', () => {
      const input = 'Hello, World!'
      const maxLength = 10
      const suffix = '...'
      const result = truncateString(input, maxLength, suffix)
      expect(result).toEqual('Hello, ...')
    })

    it('should return the original string if maxLength is less than or equal to the suffix length', () => {
      const input = 'Hello, World!'
      const maxLength = 3
      const suffix = '...'
      const result = truncateString(input, maxLength, suffix)
      expect(result).toEqual('...')
    })

    it('should handle an empty string correctly', () => {
      const input = ''
      const maxLength = 5
      const result = truncateString(input, maxLength)
      expect(result).toEqual(input)
    })

    it('should handle cases where suffix is empty', () => {
      const input = 'Hello, World!'
      const maxLength = 10
      const result = truncateString(input, maxLength, '')
      expect(result).toEqual('Hello, Wor')
    })

    it('should return the input unchanged if it is not a string', () => {
      const input = 12345 // Not a string
      const maxLength = 10
      const result = truncateString(input as unknown as string, maxLength)
      expect(result).toEqual(input) // Expecting it to return the number unchanged
    })

    it('should return the input unchanged if it is an object', () => {
      const input = { key: 'value' } // Not a string
      const maxLength = 10
      const result = truncateString(input as unknown as string, maxLength)
      expect(result).toEqual(input) // Expecting it to return the object unchanged
    })

    it('should return the input unchanged if it is an array', () => {
      const input = ['Hello', 'World'] // Not a string
      const maxLength = 10
      const result = truncateString(input as unknown as string, maxLength)
      expect(result).toEqual(input) // Expecting it to return the array unchanged
    })
  })
})
