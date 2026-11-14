type SecurityMetadata = {
  _reserved?: boolean
  _deprecated?: boolean
  _deprecated_reason?: string
}

export type ElasticsearchUser = {
  username?: string
  roles?: string[]
  full_name?: string | null
  email?: string | null
  enabled?: boolean
  metadata?: SecurityMetadata
}

export type ElasticsearchRole = {
  description?: string | null
  cluster?: string[]
  indices?: { names?: string[] | string; privileges?: string[] }[]
  metadata?: SecurityMetadata
  [key: string]: unknown
}

export type ElasticsearchRoleMapping = {
  roles?: string[]
  role_templates?: unknown[]
  enabled?: boolean
}

export type AuthenticatedUser = {
  username?: string
  roles?: string[]
  authentication_realm?: { name?: string; type?: string }
}

export type ClusterUser = {
  username: string
  roles: string[]
  full_name: string
  email: string
  enabled: boolean
  reserved: boolean
  deprecated?: boolean
  deprecated_reason?: string
}

export type IndexPrivilege = {
  names: string[]
  privileges: string[]
}

export type ClusterRole = {
  name: string
  description: string
  cluster: string[]
  indices: IndexPrivilege[]
  reserved: boolean
  deprecated: boolean
  deprecated_reason: string
  raw: Record<string, unknown>
}

export type RoleUsage = {
  users: string[]
  mappings: number
}

export type UsersSummary = {
  total: number
  builtIn: number
  custom: number
  disabled: number
  superusers: string[]
  withoutRoles: string[]
}

export type RolesSummary = {
  total: number
  builtIn: number
  custom: number
  clusterAdmin: string[]
  allIndices: string[]
  unassigned: string[]
}
