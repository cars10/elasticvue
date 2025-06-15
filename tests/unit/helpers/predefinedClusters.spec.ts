import { describe, it, expect } from 'vitest'
import { AuthType, BuildFlavor, ElasticsearchCluster } from '../../../src/store/connection'
import { importClusters } from '../../../src/composables/components/predefinedclusters/PredefinedClusters'
import { DEFAULT_CLUSTER_NAME } from '../../../src/consts'

// PredefinedCluster type
type PredefinedCluster = {
  name?: string
  username?: string
  password?: string
  apiKey?: string
  uri: string
  accessKeyId?: string
  secretAccessKey?: string
  sessionToken?: string
  region?: string
}

describe('importClusters', () => {
  const basePredefined: PredefinedCluster = {
    uri: 'http://localhost:9200',
    name: 'dev cluster'
  }

  const baseExisting: ElasticsearchCluster = {
    name: 'dev cluster',
    uri: 'http://localhost:9200',
    clusterName: '',
    version: '',
    majorVersion: '',
    distribution: '',
    uuid: '',
    status: '',
    flavor: BuildFlavor.default,
    loading: false,
    auth: {
      authType: AuthType.none,
      authData: undefined
    }
  }

  it('returns empty array if no clusters provided', () => {
    const result = importClusters([], [])
    expect(result).toEqual([])
  })

  it('returns new cluster if it does not exist in store', () => {
    const result = importClusters([basePredefined], [])
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('dev cluster')
    expect(result[0].uri).toBe('http://localhost:9200')
    expect(result[0].auth.authType).toBe(AuthType.none)
  })

  it('does not return cluster if it already exists', () => {
    const result = importClusters([basePredefined], [baseExisting])
    expect(result).toHaveLength(0)
  })

  it('uses default name if not provided', () => {
    const cluster = { uri: 'http://localhost:9200' }
    const result = importClusters([cluster], [])
    expect(result[0].name).toBe(DEFAULT_CLUSTER_NAME)
  })

  it('filters out invalid clusters (missing uri)', () => {
    const invalid = { name: 'no uri' } as PredefinedCluster
    const result = importClusters([invalid], [])
    expect(result).toHaveLength(0)
  })

  it('assigns basic auth when username and password are provided', () => {
    const cluster = {
      uri: 'http://localhost:9200',
      username: 'user',
      password: 'pass'
    }
    const result = importClusters([cluster], [])
    expect(result[0].auth.authType).toBe(AuthType.basicAuth)
    expect(result[0].auth.authData).toEqual({ username: 'user', password: 'pass' })
  })

  it('assigns API key auth when only password is provided', () => {
    const cluster = {
      uri: 'http://localhost:9200',
      password: 'api-key-only'
    }
    const result = importClusters([cluster], [])
    expect(result[0].auth.authType).toBe(AuthType.apiKey)
    expect(result[0].auth.authData).toEqual({ apiKey: 'api-key-only' })
  })

  it('assigns API key auth when apiKey is provided', () => {
    const cluster = {
      uri: 'http://localhost:9200',
      apiKey: 'some-api-key'
    }
    const result = importClusters([cluster], [])
    expect(result[0].auth.authType).toBe(AuthType.apiKey)
    expect(result[0].auth.authData).toEqual({ apiKey: 'some-api-key' })
  })

  it('assigns awsIAM auth when all required AWS fields are provided', () => {
    const cluster = {
      uri: 'http://localhost:9200',
      accessKeyId: 'akid',
      secretAccessKey: 'sak',
      region: 'us-west-1',
      sessionToken: 'token123'
    }
    const result = importClusters([cluster], [])
    expect(result[0].auth.authType).toBe(AuthType.awsIAM)
    expect(result[0].auth.authData).toEqual({
      accessKeyId: 'akid',
      secretAccessKey: 'sak',
      sessionToken: 'token123',
      region: 'us-west-1'
    })
  })
})
