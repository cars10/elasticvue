import { computed, onMounted, Ref, ref, shallowRef } from 'vue'
import { RequestState, useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useRolesStore } from '../../../store/roles.ts'
import {
  ASSIGNED_ROLES_PARAMS,
  mapElasticsearchRoles,
  mapElasticsearchUsers,
  roleUsage,
  summarizeRoles
} from '../../../helpers/security.ts'
import type {
  ClusterRole,
  ClusterUser,
  ElasticsearchRole,
  ElasticsearchRoleMapping,
  ElasticsearchUser
} from '../../../types/security.ts'

export const useClusterRoles = () => {
  const rolesStore = useRolesStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()

  const roles = shallowRef<ClusterRole[]>([])
  const users = shallowRef<ClusterUser[]>([])
  const mappings = shallowRef<Record<string, ElasticsearchRoleMapping> | null>(null)
  const usageKnown = ref(false)

  const usage = computed(() => roleUsage(users.value, mappings.value))
  const summary = computed(() => summarizeRoles(roles.value, usage.value, usageKnown.value))

  const load = async () => {
    const [rolesResult, usersResult, mappingsResult] = await Promise.allSettled([
      callElasticsearch('securityRoles') as Promise<Record<string, ElasticsearchRole>>,
      callEnrichment('securityUsers', ASSIGNED_ROLES_PARAMS) as Promise<Record<string, ElasticsearchUser>>,
      callEnrichment('securityRoleMappings', ASSIGNED_ROLES_PARAMS) as Promise<Record<string, ElasticsearchRoleMapping>>
    ])

    roles.value = rolesResult.status === 'fulfilled' ? mapElasticsearchRoles(rolesResult.value) : []
    users.value = usersResult.status === 'fulfilled' ? mapElasticsearchUsers(usersResult.value) : []
    mappings.value = mappingsResult.status === 'fulfilled' ? mappingsResult.value : null
    usageKnown.value = usersResult.status === 'fulfilled' && mappingsResult.status === 'fulfilled'
  }

  onMounted(load)

  return {
    rolesStore,
    requestState: requestState as Ref<RequestState>,
    roles,
    usage,
    usageKnown,
    summary,
    load
  }
}
