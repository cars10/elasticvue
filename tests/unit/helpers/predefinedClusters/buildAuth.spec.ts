import { describe, expect, it } from 'vitest'
import { PredefinedCluster } from '../../../../src/composables/components/predefinedclusters/PredefinedClusters'
import { buildAuth } from '../../../../src/helpers/predefinedClusters/buildAuth'
import { AuthType } from '../../../../src/store/connection'

describe('buildAuth', () => {
  it('returns basicAuth when username and password are present', () => {
    const cluster: PredefinedCluster = {
      uri: 'http://localhost:9200',
      username: 'user',
      password: 'pass'
    }

    const result = buildAuth(cluster)
    expect(result).toEqual({
      authType: AuthType.basicAuth,
      authData: { username: 'user', password: 'pass' }
    })
  })

  it('returns apiKey when only password is present', () => {
    const cluster: PredefinedCluster = {
      uri: 'http://localhost:9200',
      password: 'mykey'
    }

    const result = buildAuth(cluster)
    expect(result).toEqual({
      authType: AuthType.apiKey,
      authData: { apiKey: 'mykey' }
    })
  })

  it('returns apiKey when only apiKey is present', () => {
    const cluster: PredefinedCluster = {
      uri: 'http://localhost:9200',
      apiKey: 'abc123'
    }

    const result = buildAuth(cluster)
    expect(result).toEqual({
      authType: AuthType.apiKey,
      authData: { apiKey: 'abc123' }
    })
  })

  it('returns awsIAM when S3 credentials are present', () => {
    const cluster: PredefinedCluster = {
      uri: 'http://localhost:9200',
      S3accessKeyId: 'AKIA123',
      S3secretAccessKey: 'SECRET',
      S3region: 'us-west-1',
      S3sessionToken: 'SESSION'
    }

    const result = buildAuth(cluster)
    expect(result).toEqual({
      authType: AuthType.awsIAM,
      authData: {
        accessKeyId: 'AKIA123',
        secretAccessKey: 'SECRET',
        region: 'us-west-1',
        sessionToken: 'SESSION'
      }
    })
  })

  it('returns none when no credentials are present', () => {
    const cluster: PredefinedCluster = { uri: 'http://localhost:9200' }
    const result = buildAuth(cluster)

    expect(result).toEqual({ authType: AuthType.none, authData: {} })
  })
})