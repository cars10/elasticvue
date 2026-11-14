import { describe, expect, it } from 'vitest'
import { PredefinedCluster } from '../../../../src/composables/components/predefinedclusters/PredefinedClusters'
import { buildAuth } from '../../../../src/helpers/predefinedClusters/buildAuth'
import { AuthType, SecretStorage } from '../../../../src/store/connection'

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
describe('buildAuth secret storage', () => {
  const session = SecretStorage.session

  it('asks for the password when only a username is configured', () => {
    expect(buildAuth({ uri: 'http://localhost:9200', username: 'admin' })).toEqual({
      authType: AuthType.basicAuth,
      authData: { username: 'admin', password: '' },
      secretStorage: session
    })
  })

  it('never imports secrets when the config asks for session storage', () => {
    expect(buildAuth({ uri: 'http://localhost:9200', username: 'admin', password: 'pw', secretStorage: session })).toEqual({
      authType: AuthType.basicAuth,
      authData: { username: 'admin', password: '' },
      secretStorage: session
    })
    expect(buildAuth({ uri: 'http://localhost:9200', apiKey: 'key', secretStorage: session })).toEqual({
      authType: AuthType.apiKey,
      authData: { apiKey: '' },
      secretStorage: session
    })
  })

  it('asks for an api key when only session storage is configured', () => {
    expect(buildAuth({ uri: 'http://localhost:9200', secretStorage: session })).toEqual({
      authType: AuthType.apiKey,
      authData: { apiKey: '' },
      secretStorage: session
    })
  })

  it('asks for aws secrets when only key id and region are configured', () => {
    expect(buildAuth({ uri: 'https://es.amazonaws.com', S3accessKeyId: 'AKIA', S3region: 'eu-west-1' })).toEqual({
      authType: AuthType.awsIAM,
      authData: { accessKeyId: 'AKIA', secretAccessKey: '', region: 'eu-west-1' },
      secretStorage: session
    })
  })

  it('drops the aws session token when secrets are not stored', () => {
    const auth = buildAuth({
      uri: 'https://es.amazonaws.com',
      S3accessKeyId: 'AKIA',
      S3secretAccessKey: 'SECRET',
      S3sessionToken: 'TOKEN',
      S3region: 'eu-west-1',
      secretStorage: session
    })

    expect(auth.authData).toEqual({ accessKeyId: 'AKIA', secretAccessKey: '', region: 'eu-west-1' })
  })

  it('ignores aws config without region', () => {
    expect(buildAuth({ uri: 'https://es.amazonaws.com', S3accessKeyId: 'AKIA', S3secretAccessKey: 'SECRET' })).toEqual({
      authType: AuthType.none,
      authData: {}
    })
  })
})
