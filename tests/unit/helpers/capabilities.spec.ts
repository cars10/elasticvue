import { describe, expect, it } from 'vitest'
import { buildCapabilities, securityBasePath } from '../../../src/helpers/capabilities'
import { BuildFlavor } from '../../../src/store/connection'

const es = (version: string, flavor = BuildFlavor.default) => ({ version, distribution: 'elasticsearch', flavor })
const opensearch = (version: string) => ({ version, distribution: 'opensearch', flavor: BuildFlavor.default })

describe('buildCapabilities', () => {
  it.each([
    ['1.7.6', es('1.7.6'), { security: false, slm: false, verify: true, forcemerge: false, clone: false, types: true }],
    ['2.4.6', es('2.4.6'), { security: false, slm: false, verify: true, forcemerge: true, clone: false, types: true }],
    ['5.6.16', es('5.6.16'), { security: true, slm: false, verify: true, forcemerge: true, clone: false, types: true }],
    ['6.5.4', es('6.5.4'), { security: true, slm: false, verify: true, forcemerge: true, clone: false, types: true }],
    ['6.6.0', es('6.6.0'), { security: true, slm: false, verify: true, forcemerge: true, clone: false, types: true }],
    ['7.3.2', es('7.3.2'), { security: true, slm: false, verify: true, forcemerge: true, clone: true, types: false }],
    ['7.4.0', es('7.4.0'), { security: true, slm: true, verify: true, forcemerge: true, clone: true, types: false }],
    ['8.15.0', es('8.15.0'), { security: true, slm: true, verify: true, forcemerge: true, clone: true, types: false }],
    ['9.1.0', es('9.1.0'), { security: true, slm: true, verify: true, forcemerge: true, clone: true, types: false }],
    ['opensearch 1', opensearch('1.3.20'), { security: false, slm: false, verify: true, forcemerge: true, clone: true, types: false }],
    ['opensearch 2', opensearch('2.19.7'), { security: false, slm: false, verify: true, forcemerge: true, clone: true, types: false }],
    ['opensearch 3', opensearch('3.9.0'), { security: false, slm: false, verify: true, forcemerge: true, clone: true, types: false }]
  ])('%s', (_name, cluster, expected) => {
    const capabilities = buildCapabilities(cluster)

    expect(capabilities.security.available).toBe(expected.security)
    expect(capabilities.snapshots.slm).toBe(expected.slm)
    expect(capabilities.snapshots.repositoryVerify).toBe(expected.verify)
    expect(capabilities.indices.forcemerge).toBe(expected.forcemerge)
    expect(capabilities.indices.clone).toBe(expected.clone)
    expect(capabilities.indices.mappingTypes).toBe(expected.types)
  })

  it('gates security fields by version', () => {
    expect(buildCapabilities(es('5.6.16')).security.userEnabledInBody).toBe(false)
    expect(buildCapabilities(es('6.0.0')).security.userEnabledInBody).toBe(true)
    expect(buildCapabilities(es('6.3.0')).security.roleApplications).toBe(false)
    expect(buildCapabilities(es('6.4.0')).security.roleApplications).toBe(true)
    expect(buildCapabilities(es('6.6.0')).security.allowRestrictedIndices).toBe(false)
    expect(buildCapabilities(es('6.7.0')).security.allowRestrictedIndices).toBe(true)
    expect(buildCapabilities(es('8.14.3')).security.roleDescription).toBe(false)
    expect(buildCapabilities(es('8.15.0')).security.roleDescription).toBe(true)
  })

  it('gates 8.x defaults', () => {
    expect(buildCapabilities(es('7.17.10')).indices.expandWildcardsAll).toBe(false)
    expect(buildCapabilities(es('8.0.0')).indices.expandWildcardsAll).toBe(true)
    expect(buildCapabilities(es('7.17.10')).nodes.shards).toBe(false)
    expect(buildCapabilities(es('8.0.0')).nodes.shards).toBe(true)
    expect(buildCapabilities(es('7.17.10')).destructiveRequiresNameDefault).toBe(false)
    expect(buildCapabilities(es('8.0.0')).destructiveRequiresNameDefault).toBe(true)
    expect(buildCapabilities(opensearch('3.9.0')).destructiveRequiresNameDefault).toBe(false)
  })

  it('detects serverless', () => {
    const capabilities = buildCapabilities(es('8.11.0', BuildFlavor.serverless))
    expect(capabilities.serverless).toBe(true)
    expect(capabilities.elasticsearch).toBe(true)
    expect(capabilities.security.available).toBe(true)
    expect(capabilities.security.users).toBe(false)
    expect(capabilities.indices).toMatchObject({
      reindex: true,
      forcemerge: false,
      clone: false,
      openClose: false,
      stats: false,
      flush: false,
      clearCache: false
    })
    expect(buildCapabilities(es('8.11.0')).serverless).toBe(false)
    expect(buildCapabilities(es('8.11.0')).security.users).toBe(true)
    expect(buildCapabilities(es('8.11.0')).indices).toMatchObject({ clone: true, openClose: true, stats: true })
  })

  it('gates the task management api', () => {
    expect(buildCapabilities(es('1.7.6')).tasks).toBe(false)
    expect(buildCapabilities(es('2.2.2')).tasks).toBe(false)
    expect(buildCapabilities(es('2.3.0')).tasks).toBe(true)
    expect(buildCapabilities(es('9.1.0')).tasks).toBe(true)
    expect(buildCapabilities(opensearch('1.3.20')).tasks).toBe(true)
    expect(buildCapabilities(es('8.11.0', BuildFlavor.serverless)).tasks).toBe(false)
  })

  it('treats unknown versions as modern for security but disables version gated features', () => {
    const capabilities = buildCapabilities(es(''))
    expect(capabilities.security.available).toBe(true)
    expect(capabilities.indices.clone).toBe(false)
    expect(capabilities.snapshots.slm).toBe(false)
  })

  it('maps opensearch to the elasticsearch 7.10 api', () => {
    const capabilities = buildCapabilities(opensearch('1.3.20'))
    expect(capabilities.version).toBe('7.10.2')
    expect(capabilities.elasticsearch).toBe(false)
    expect(capabilities.supported).toBe(true)
    expect(capabilities.indices).toMatchObject({ reindex: true, deleteByQuery: true, expandWildcardsAll: false })
    expect(capabilities.tools).toMatchObject({ maxHeadroom: false, votingExclusions: true, dataStreams: true })
  })

  it('uses the latest elasticsearch api for unsupported distributions', () => {
    const capabilities = buildCapabilities({ version: '3.1', distribution: 'unknown', flavor: BuildFlavor.default })
    expect(capabilities.version).toBe('9.0.0')
    expect(capabilities.elasticsearch).toBe(true)
    expect(capabilities.supported).toBe(false)
    expect(capabilities.indices).toMatchObject({ clone: true, mappingTypes: false })
  })

  it('disables everything without a cluster', () => {
    const capabilities = buildCapabilities(null)
    expect(capabilities.elasticsearch).toBe(false)
    expect(capabilities.serverless).toBe(false)
    expect(capabilities.security.available).toBe(false)
  })
})

describe('securityBasePath', () => {
  it('uses the short path from 6.6 and when unknown', () => {
    expect(securityBasePath('6.5.4')).toBe('_xpack/security')
    expect(securityBasePath('6.6.0')).toBe('_security')
    expect(securityBasePath(undefined)).toBe('_security')
  })
})
