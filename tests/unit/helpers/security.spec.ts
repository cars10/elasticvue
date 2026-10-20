import { describe, expect, it } from 'vitest'
import {
  mapElasticsearchRoles,
  mapElasticsearchUsers,
  namePreview,
  roleUsage,
  securityErrorKind,
  summarizeRoles,
  summarizeUsers
} from '../../../src/helpers/security'

const users = mapElasticsearchUsers({
  elastic: { roles: ['superuser'], metadata: { _reserved: true }, enabled: true },
  kibana: { roles: ['kibana_system'], metadata: { _reserved: true, _deprecated: true }, enabled: true },
  alice: { roles: ['reader', 'superuser'], full_name: 'Alice' },
  bob: { roles: [], enabled: false }
})

const roles = mapElasticsearchRoles({
  superuser: { cluster: ['all'], indices: [{ names: ['*'], privileges: ['all'] }], metadata: { _reserved: true } },
  reader: { cluster: ['monitor'], indices: [{ names: 'logs-*', privileges: ['read'] }] },
  mapped: { cluster: [] },
  orphan: { cluster: ['manage'] }
})

describe('mapElasticsearchUsers', () => {
  it('sorts users and defaults missing fields', () => {
    expect(users.map((u) => u.username)).toEqual(['alice', 'bob', 'elastic', 'kibana'])
    expect(users[0]).toMatchObject({ roles: ['reader', 'superuser'], enabled: true, reserved: false, email: '' })
  })
})

describe('mapElasticsearchRoles', () => {
  it('normalizes index names', () => {
    const reader = roles.find((r) => r.name === 'reader')
    expect(reader?.indices).toEqual([{ names: ['logs-*'], privileges: ['read'] }])
  })
})

describe('summarizeUsers', () => {
  it('counts built-in, disabled, superusers and users without roles', () => {
    expect(summarizeUsers(users)).toEqual({
      total: 4,
      builtIn: 2,
      custom: 2,
      disabled: 1,
      superusers: ['alice', 'elastic'],
      withoutRoles: ['bob']
    })
  })
})

describe('summarizeRoles', () => {
  const usage = roleUsage(users, { ldap: { roles: ['mapped'] } })

  it('tracks where roles are used', () => {
    expect(usage.superuser.users).toEqual(['alice', 'elastic'])
    expect(usage.mapped).toEqual({ users: [], mappings: 1 })
  })

  it('finds admin roles, full index access and unused custom roles', () => {
    expect(summarizeRoles(roles, usage, true)).toEqual({
      total: 4,
      builtIn: 1,
      custom: 3,
      clusterAdmin: ['orphan', 'superuser'],
      allIndices: ['superuser'],
      unassigned: ['orphan']
    })
  })

  it('does not guess unused roles without usage data', () => {
    expect(summarizeRoles(roles, {}, false).unassigned).toEqual([])
  })
})

describe('namePreview', () => {
  it('shortens long lists', () => {
    expect(namePreview(['a', 'b', 'c', 'd', 'e'])).toBe('a, b, c +2 more')
    expect(namePreview([])).toBe('—')
  })
})

describe('securityErrorKind', () => {
  it('separates permission errors from missing security', () => {
    expect(securityErrorKind(403)).toBe('forbidden')
    expect(securityErrorKind(400)).toBe('unavailable')
    expect(securityErrorKind(404)).toBe('unavailable')
  })
})
