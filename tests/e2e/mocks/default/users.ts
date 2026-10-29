import {
  securityApiBase,
  supportsAllowRestrictedIndices,
  supportsRoleApplications,
  supportsRoleDescription,
  supportsSecurityDeprecated
} from '../../helpers/security'

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

const baseUsers = {
  elastic: {
    username: 'elastic',
    roles: ['superuser'],
    full_name: 'Elastic Administrator',
    email: 'elastic@example.com',
    metadata: { _reserved: true },
    enabled: true
  },
  app_user: {
    username: 'app_user',
    roles: ['read_only', 'watcher_admin'],
    full_name: 'App User',
    email: 'app@example.com',
    metadata: {},
    enabled: true
  },
  disabled_user: {
    username: 'disabled_user',
    roles: ['viewer'],
    full_name: 'Disabled User',
    email: 'disabled@example.com',
    metadata: {},
    enabled: false
  }
}

const baseRoles = {
  superuser: {
    cluster: ['all'],
    indices: [{ names: ['*'], privileges: ['all'] }],
    applications: [],
    run_as: [],
    metadata: { _reserved: true },
    description: 'Grants full access to the cluster'
  },
  read_only: {
    cluster: ['monitor'],
    indices: [{ names: ['logs-*', 'metrics-*'], privileges: ['read'] }],
    applications: [{ application: 'kibana-.kibana', privileges: ['read'] }],
    run_as: [],
    metadata: {},
    description: 'Read-only access'
  },
  watcher_admin: {
    cluster: ['monitor', 'manage_watcher'],
    indices: [{ names: ['.watcher-history-*'], privileges: ['read'] }],
    applications: [],
    run_as: [],
    metadata: {},
    description: 'Watcher administration'
  },
  viewer: {
    cluster: [],
    indices: [{ names: ['movies'], privileges: ['read'], allow_restricted_indices: false }],
    applications: [],
    run_as: [],
    metadata: {},
    description: 'View movies index'
  }
}

export const buildSecurityUsers = (version: string) => {
  const json = clone(baseUsers)

  if (supportsSecurityDeprecated(version)) {
    json.deprecated_user = {
      username: 'deprecated_user',
      roles: ['viewer'],
      full_name: 'Deprecated User',
      email: 'deprecated@example.com',
      metadata: { _deprecated: true, _deprecated_reason: 'Use app_user instead' },
      enabled: true
    }
  }

  return {
    url: new RegExp(`localhost:9200/${securityApiBase(version)}/user(\\?|$)`),
    json
  }
}

export const buildSecurityRoles = (version: string) => {
  const json: Record<string, Record<string, unknown>> = clone(baseRoles)

  for (const role of Object.values(json)) {
    if (!supportsRoleDescription(version)) delete role.description
    if (!supportsRoleApplications(version)) delete role.applications

    if (Array.isArray(role.indices) && !supportsAllowRestrictedIndices(version)) {
      role.indices = role.indices.map((entry: Record<string, unknown>) => {
        const rest = { ...entry }
        delete rest.allow_restricted_indices
        return rest
      })
    }
  }

  if (supportsSecurityDeprecated(version)) {
    json.deprecated_role = {
      cluster: [],
      indices: [{ names: ['old-*'], privileges: ['read'] }],
      applications: [],
      run_as: [],
      metadata: { _deprecated: true, _deprecated_reason: 'Replaced by viewer' },
      ...(supportsRoleDescription(version) ? { description: 'Deprecated role' } : {})
    }
  }

  return {
    url: new RegExp(`localhost:9200/${securityApiBase(version)}/role(\\?|$)`),
    json
  }
}
