import { describe, expect, it } from 'vitest'
import {
  elasticsearchCompatibleVersion,
  isSupportedDistribution,
  isSupportedVersion,
  parseClusterInfo,
  productName
} from '../../../src/helpers/clusterInfo'
import { BuildFlavor } from '../../../src/store/connection'

describe('parseClusterInfo', () => {
  it('parses elasticsearch', () => {
    expect(parseClusterInfo({ name: 'node-1', cluster_name: 'es', version: { number: '8.15.0' } })).toEqual({
      clusterName: 'es',
      version: '8.15.0',
      majorVersion: '8',
      distribution: 'elasticsearch',
      flavor: BuildFlavor.default
    })
  })

  it('parses two digit major versions', () => {
    expect(parseClusterInfo({ cluster_name: 'es', version: { number: '10.1.0' } }).majorVersion).toBe('10')
  })

  it('parses serverless', () => {
    expect(parseClusterInfo({ cluster_name: 'es', version: { number: '8.11.0', build_flavor: 'serverless' } }).flavor).toBe(
      BuildFlavor.serverless
    )
    expect(parseClusterInfo({ cluster_name: 'es', version: { number: '7.17.0', build_flavor: 'oss' } }).flavor).toBe(BuildFlavor.default)
  })

  it('parses opensearch', () => {
    const info = parseClusterInfo({ cluster_name: 'os', version: { distribution: 'opensearch', number: '3.9.0' } })
    expect(info).toMatchObject({ distribution: 'opensearch', version: '3.9.0', majorVersion: '3' })
  })

  it('parses products that report the version as string and have no cluster_name', () => {
    expect(parseClusterInfo({ name: 'scope', version: '9.2.1' })).toEqual({
      clusterName: 'scope',
      version: '9.2.1',
      majorVersion: '9',
      distribution: 'unknown',
      flavor: BuildFlavor.default
    })
  })

  it('keeps other distributions', () => {
    expect(parseClusterInfo({ cluster_name: 'x', version: { distribution: 'Easysearch', number: '1.9.0' } }).distribution).toBe(
      'easysearch'
    )
  })

  it('does not fail on unexpected responses', () => {
    for (const body of [null, undefined, '', 'ok', {}, { version: null }, { version: {} }, { version: { number: 'abc' } }]) {
      const info = parseClusterInfo(body)
      expect(info.majorVersion).toBe('')
      expect(info.flavor).toBe(BuildFlavor.default)
    }
  })
})

describe('distribution helpers', () => {
  it('detects supported distributions', () => {
    expect(isSupportedDistribution('elasticsearch')).toBe(true)
    expect(isSupportedDistribution('opensearch')).toBe(true)
    expect(isSupportedDistribution('')).toBe(true)
    expect(isSupportedDistribution('unknown')).toBe(false)
    expect(isSupportedDistribution('easysearch')).toBe(false)
  })

  it('detects supported versions', () => {
    expect(isSupportedVersion({ distribution: 'elasticsearch', version: '6.8.23' })).toBe(false)
    expect(isSupportedVersion({ distribution: 'elasticsearch', version: '9.1.0' })).toBe(true)
    expect(isSupportedVersion({ distribution: 'opensearch', version: '1.3.20' })).toBe(true)
    expect(isSupportedVersion({ distribution: 'opensearch', version: '3.9.0' })).toBe(true)
    expect(isSupportedVersion({ distribution: 'opensearch', version: '4.0.0' })).toBe(false)
    expect(isSupportedVersion({ distribution: 'elasticsearch', version: '' })).toBe(true)
  })

  it('maps versions to the elasticsearch api', () => {
    expect(elasticsearchCompatibleVersion({ distribution: 'elasticsearch', version: '8.15.0' })).toBe('8.15.0')
    expect(elasticsearchCompatibleVersion({ distribution: 'opensearch', version: '3.9.0' })).toBe('7.10.2')
    expect(elasticsearchCompatibleVersion({ distribution: 'unknown', version: '3.1' })).toBe('9.0.0')
  })

  it('names products', () => {
    expect(productName('elasticsearch')).toBe('Elasticsearch')
    expect(productName('opensearch')).toBe('OpenSearch')
    expect(productName('easysearch')).toBe('Easysearch')
    expect(productName('unknown')).toBe('')
  })
})
