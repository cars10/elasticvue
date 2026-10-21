import type {
  ClusterRole,
  ClusterUser,
  ElasticsearchRole,
  ElasticsearchRoleMapping,
  ElasticsearchUser,
  RoleUsage,
  RolesSummary,
  UsersSummary
} from '../types/security.ts'

export const SUPERUSER_ROLE = 'superuser'

export const ROLE_NAMES_PARAMS = { filter_path: '*.cluster' }

export const ASSIGNED_ROLES_PARAMS = { filter_path: '*.roles' }

const CLUSTER_ADMIN_PRIVILEGES = ['all', 'manage', 'manage_security']

export const isClusterAdminPrivilege = (privilege: string) => CLUSTER_ADMIN_PRIVILEGES.includes(privilege)

export const mapElasticsearchUsers = (users: Record<string, ElasticsearchUser> | null): ClusterUser[] =>
  Object.entries(users || {})
    .map(([username, user]) => ({
      username: user.username || username,
      roles: [...(user.roles || [])].sort(),
      full_name: user.full_name || '',
      email: user.email || '',
      enabled: user.enabled !== false,
      reserved: !!user.metadata?._reserved,
      deprecated: !!user.metadata?._deprecated,
      deprecated_reason: user.metadata?._deprecated_reason || ''
    }))
    .sort((a, b) => a.username.localeCompare(b.username))

const toArray = (value?: string[] | string) => (Array.isArray(value) ? value : value ? [value] : [])

export const mapElasticsearchRoles = (roles: Record<string, ElasticsearchRole> | null): ClusterRole[] =>
  Object.entries(roles || {})
    .map(([name, role]) => ({
      name,
      description: role.description || '',
      cluster: Array.isArray(role.cluster) ? [...role.cluster].sort() : [],
      indices: (role.indices || []).map((entry) => ({
        names: toArray(entry.names),
        privileges: entry.privileges || []
      })),
      reserved: !!role.metadata?._reserved,
      deprecated: !!role.metadata?._deprecated,
      deprecated_reason: role.metadata?._deprecated_reason || '',
      raw: { name, ...role }
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

export const summarizeUsers = (users: ClusterUser[]): UsersSummary => {
  const builtIn = users.filter((user) => user.reserved).length

  return {
    total: users.length,
    builtIn,
    custom: users.length - builtIn,
    disabled: users.filter((user) => !user.enabled).length,
    superusers: users.filter((user) => user.roles.includes(SUPERUSER_ROLE)).map((user) => user.username),
    withoutRoles: users.filter((user) => user.roles.length === 0).map((user) => user.username)
  }
}

export const roleUsage = (
  users: ClusterUser[],
  mappings: Record<string, ElasticsearchRoleMapping> | null
): Record<string, RoleUsage> => {
  const usage: Record<string, RoleUsage> = {}
  const entry = (role: string) => (usage[role] ??= { users: [], mappings: 0 })

  for (const user of users) user.roles.forEach((role) => entry(role).users.push(user.username))
  for (const mapping of Object.values(mappings || {})) mapping.roles?.forEach((role) => entry(role).mappings++)

  return usage
}

const grantsAllIndices = (role: ClusterRole) =>
  role.indices.some((entry) => entry.names.includes('*') && entry.privileges.includes('all'))

export const summarizeRoles = (roles: ClusterRole[], usage: Record<string, RoleUsage>, usageKnown: boolean): RolesSummary => {
  const custom = roles.filter((role) => !role.reserved)

  return {
    total: roles.length,
    builtIn: roles.length - custom.length,
    custom: custom.length,
    clusterAdmin: roles.filter((role) => role.cluster.some(isClusterAdminPrivilege)).map((role) => role.name),
    allIndices: roles.filter(grantsAllIndices).map((role) => role.name),
    unassigned: usageKnown
      ? custom.filter((role) => !usage[role.name]?.users.length && !usage[role.name]?.mappings).map((role) => role.name)
      : []
  }
}

export type SecurityErrorKind = 'forbidden' | 'unavailable'

export const securityErrorKind = (status: number): SecurityErrorKind =>
  status === 401 || status === 403 ? 'forbidden' : 'unavailable'
