import { describe, it, expect } from 'vitest'
import { cleanIndexName } from '../../../src/helpers/cleanIndexName'

describe.concurrent('helpers/cleanIndexName.ts', () => {
  it('should do nothing when no special characters are present', () => {
    const indexNames = [
      '',
      'movies',
      'kube-2024.12.21'
    ]
    indexNames.forEach(indexName => {
      expect(cleanIndexName(indexName)).toBe(indexName)
    })
  })

  it('should encode special characters inside < and >', () => {
    const indexName = 'foo/<kube-{now/d}>/_doc'
    const cleanedName = 'foo/%3Ckube-%7Bnow%2Fd%7D%3E/_doc'
    expect(cleanIndexName(indexName)).toBe(cleanedName)
  })

  it('should encode multiple <...> segments correctly', () => {
    const indexName = 'foo/<kube-{now/d}>/bar/<baz+foo>'
    const cleanedName = 'foo/%3Ckube-%7Bnow%2Fd%7D%3E/bar/%3Cbaz%2Bfoo%3E'
    expect(cleanIndexName(indexName)).toBe(cleanedName)
  })

  it('should encode % everywhere, but other characters only inside < and >', () => {
    const indexName = 'foo/%/<kube%+>/bar'
    const cleanedName = 'foo/%25/%3Ckube%25%2B%3E/bar'
    expect(cleanIndexName(indexName)).toBe(cleanedName)
  })

  it('should not encode characters outside of < and >', () => {
    const indexName = 'movies/kube+foo/bar'
    const cleanedName = 'movies/kube+foo/bar'
    expect(cleanIndexName(indexName)).toBe(cleanedName)
  })
})
