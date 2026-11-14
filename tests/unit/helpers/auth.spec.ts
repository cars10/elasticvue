import { describe, expect, it } from 'vitest'
import { normalizeAuth, pickSecrets, withFields, withoutSecrets } from '../../../src/helpers/auth'
import { AuthType, SecretStorage } from '../../../src/store/connection'
import { clusterAuthHeader } from '../../../src/helpers/elasticsearchAdapter'

describe.concurrent('helpers/auth.ts', () => {
  describe.concurrent('normalizeAuth', () => {
    it('removes fields of other auth types', ({ expect }) => {
      const auth = normalizeAuth({
        authType: AuthType.apiKey,
        authData: { username: 'elastic', password: 'old', apiKey: 'key' }
      })

      expect(auth).toEqual({ authType: AuthType.apiKey, authData: { apiKey: 'key' } })
    })

    it('keeps the old api key behaviour of basic auth without username', ({ expect }) => {
      const auth = normalizeAuth({ authType: AuthType.basicAuth, authData: { username: '', password: 'key' } })

      expect(auth).toEqual({ authType: AuthType.apiKey, authData: { apiKey: 'key' } })
    })

    it('keeps basic auth without any credentials', ({ expect }) => {
      const auth = normalizeAuth({ authType: AuthType.basicAuth, authData: { username: '', password: '' } })

      expect(auth).toEqual({ authType: AuthType.basicAuth, authData: { username: '', password: '' } })
    })

    it('fills missing fields with empty strings', ({ expect }) => {
      expect(normalizeAuth({ authType: AuthType.basicAuth })).toEqual({
        authType: AuthType.basicAuth,
        authData: { username: '', password: '' }
      })
      expect(normalizeAuth({ authType: AuthType.awsIAM, authData: null })).toEqual({
        authType: AuthType.awsIAM,
        authData: { accessKeyId: '', secretAccessKey: '', region: '' }
      })
    })

    it('drops empty aws session tokens', ({ expect }) => {
      const auth = normalizeAuth({
        authType: AuthType.awsIAM,
        authData: { accessKeyId: 'id', secretAccessKey: 'secret', region: 'eu-west-1', sessionToken: '' }
      })

      expect(auth.authData).toEqual({ accessKeyId: 'id', secretAccessKey: 'secret', region: 'eu-west-1' })
    })

    it('falls back to no auth for unknown or broken data', ({ expect }) => {
      const none = { authType: AuthType.none, authData: {} }

      expect(normalizeAuth(undefined)).toEqual(none)
      expect(normalizeAuth('basicAuth')).toEqual(none)
      expect(normalizeAuth({ authType: 'kerberos', authData: { ticket: 'x' } })).toEqual(none)
      expect(normalizeAuth({ authType: AuthType.none, authData: { password: 'leftover' } })).toEqual(none)
    })

    it('only keeps the session secret storage', ({ expect }) => {
      const basic = { authType: AuthType.basicAuth, authData: { username: 'a', password: 'b' } }

      expect(normalizeAuth({ ...basic, secretStorage: SecretStorage.session }).secretStorage).toBe(SecretStorage.session)
      expect(normalizeAuth({ ...basic, secretStorage: SecretStorage.local })).not.toHaveProperty('secretStorage')
      expect(normalizeAuth({ ...basic, secretStorage: 'keyring' })).not.toHaveProperty('secretStorage')
      expect(normalizeAuth({ authType: AuthType.none, authData: {}, secretStorage: SecretStorage.session })).not.toHaveProperty(
        'secretStorage'
      )
    })
  })

  describe.concurrent('secrets', () => {
    const basic = normalizeAuth({ authType: AuthType.basicAuth, authData: { username: 'elastic', password: 'pw' } })
    const apiKey = normalizeAuth({ authType: AuthType.apiKey, authData: { apiKey: 'key' } })
    const aws = normalizeAuth({
      authType: AuthType.awsIAM,
      authData: { accessKeyId: 'id', secretAccessKey: 'secret', region: 'eu-west-1', sessionToken: 'token' }
    })

    it('picks only secret fields', ({ expect }) => {
      expect(pickSecrets(basic)).toEqual({ password: 'pw' })
      expect(pickSecrets(apiKey)).toEqual({ apiKey: 'key' })
      expect(pickSecrets(aws)).toEqual({ secretAccessKey: 'secret', sessionToken: 'token' })
    })

    it('removes secrets but keeps identities', ({ expect }) => {
      expect(withoutSecrets(basic).authData).toEqual({ username: 'elastic', password: '' })
      expect(withoutSecrets(apiKey).authData).toEqual({ apiKey: '' })
      expect(withoutSecrets(aws).authData).toEqual({ accessKeyId: 'id', secretAccessKey: '', region: 'eu-west-1' })
    })

    it('merges session fields over the stored auth', ({ expect }) => {
      const stored = withoutSecrets({ ...basic, secretStorage: SecretStorage.session })

      expect(withFields(stored, { username: 'admin', password: 'secret' })).toEqual({
        authType: AuthType.basicAuth,
        authData: { username: 'admin', password: 'secret' },
        secretStorage: SecretStorage.session
      })
    })
  })
})

describe('clusterAuthHeader', () => {
  const decode = (header?: string) => decodeURIComponent(escape(atob(header!.split(' ')[1])))

  it('encodes username and password', () => {
    const header = clusterAuthHeader({ authType: AuthType.basicAuth, authData: { username: 'user', password: 'pä:ss' } })

    expect(header?.startsWith('Basic ')).toBe(true)
    expect(decode(header)).toBe('user:pä:ss')
  })

  it('keeps the colon for empty passwords', () => {
    const header = clusterAuthHeader({ authType: AuthType.basicAuth, authData: { username: 'user', password: '' } })

    expect(decode(header)).toBe('user:')
  })

  it('sends nothing without credentials', () => {
    expect(clusterAuthHeader({ authType: AuthType.basicAuth, authData: { username: '', password: '' } })).toBeUndefined()
    expect(clusterAuthHeader({ authType: AuthType.apiKey, authData: { apiKey: '' } })).toBeUndefined()
    expect(clusterAuthHeader({ authType: AuthType.none, authData: {} })).toBeUndefined()
  })

  it('uses the ApiKey scheme for api keys only', () => {
    expect(clusterAuthHeader({ authType: AuthType.apiKey, authData: { apiKey: 'abc' } })).toBe('ApiKey abc')
  })

  it('leaves aws requests to request signing', () => {
    const auth = { authType: AuthType.awsIAM as const, authData: { accessKeyId: 'a', secretAccessKey: 'b', region: 'c' } }
    expect(clusterAuthHeader(auth)).toBeUndefined()
  })
})
