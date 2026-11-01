import { stringifyJson } from '../../../helpers/json/stringify.ts'
import { parseJson } from '../../../helpers/json/parse.ts'
import { useClusterSession } from '../../../store/clusterSession.ts'

export type RoleFormData = {
  name: string
  description: string
  cluster: string[]
  indicesJson: string
  run_as: string[]
}

export const DEFAULT_INDICES_JSON = `[
  {
    "names": ["*"],
    "privileges": ["read"]
  }
]`

export const INDICES_JSON_EXAMPLE = `[
  {
    "names": ["index1", "index2"],
    "privileges": ["read", "write"],
    "field_security": {
      "grant": ["title", "body"]
    },
    "query": "{\\"match\\": {\\"title\\": \\"foo\\"}}"
  }
]`

export const CLUSTER_PRIVILEGE_OPTIONS = [
  'all',
  'monitor',
  'manage',
  'manage_security',
  'manage_index_templates',
  'manage_ingest_pipelines',
  'manage_pipeline',
  'manage_transform',
  'manage_ml',
  'manage_watcher',
  'manage_ilm',
  'create_snapshot',
  'monitor_snapshot'
]

export const emptyRoleForm = (): RoleFormData => ({
  name: '',
  description: '',
  cluster: [],
  indicesJson: DEFAULT_INDICES_JSON,
  run_as: []
})

export const roleFormFromClusterRole = (raw: Record<string, unknown>): RoleFormData => {
  const indices = raw.indices ?? []
  return {
    name: String(raw.name || ''),
    description: typeof raw.description === 'string' ? raw.description : '',
    cluster: Array.isArray(raw.cluster) ? [...(raw.cluster as string[])] : [],
    indicesJson: stringifyJson(indices, null, 2),
    run_as: Array.isArray(raw.run_as) ? [...(raw.run_as as string[])] : []
  }
}

export const isValidIndicesJson = (indicesJson: string): boolean => {
  try {
    return Array.isArray(parseJson(indicesJson))
  } catch (_e) {
    return false
  }
}

const sanitizeIndices = (indices: unknown): unknown => {
  if (!Array.isArray(indices)) return indices
  if (useClusterSession().capabilities.security.allowRestrictedIndices) return indices

  return indices.map((entry) => {
    if (!entry || typeof entry !== 'object') return entry
    const { allow_restricted_indices: _omit, ...rest } = entry as Record<string, unknown>
    return rest
  })
}

const sanitizeMetadata = (metadata: unknown): Record<string, unknown> | undefined => {
  if (!metadata || typeof metadata !== 'object') return undefined

  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata as Record<string, unknown>)) {
    if (!key.startsWith('_')) cleaned[key] = value
  }

  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

export const buildRoleBody = (form: RoleFormData, existingRaw?: Record<string, unknown>) => {
  const body: Record<string, unknown> = existingRaw ? { ...existingRaw } : {}
  delete body.name
  delete body.transient_metadata

  body.cluster = form.cluster
  body.indices = sanitizeIndices(parseJson(form.indicesJson))
  body.run_as = form.run_as

  const { security } = useClusterSession().capabilities
  if (security.roleDescription) {
    body.description = form.description.trim()
  } else {
    delete body.description
  }

  if (!security.roleApplications) {
    delete body.applications
  }

  const metadata = sanitizeMetadata(body.metadata)
  if (metadata) body.metadata = metadata
  else delete body.metadata

  return body
}
