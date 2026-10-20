import { computed, onMounted, Ref, shallowRef } from 'vue'
import { RequestState, useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useUsersStore } from '../../../store/users.ts'
import { mapElasticsearchUsers, summarizeUsers } from '../../../helpers/security.ts'
import type { AuthenticatedUser, ClusterUser, ElasticsearchUser } from '../../../types/security.ts'

export const useClusterUsers = () => {
  const usersStore = useUsersStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()

  const users = shallowRef<ClusterUser[]>([])
  const currentUser = shallowRef<AuthenticatedUser | null>(null)
  const summary = computed(() => summarizeUsers(users.value))

  const load = async () => {
    const [usersResult, authResult] = await Promise.allSettled([
      callElasticsearch('securityUsers') as Promise<Record<string, ElasticsearchUser>>,
      callEnrichment('securityAuthenticate') as Promise<AuthenticatedUser>
    ])

    users.value = usersResult.status === 'fulfilled' ? mapElasticsearchUsers(usersResult.value) : []
    currentUser.value = authResult.status === 'fulfilled' ? authResult.value : null
  }

  onMounted(load)

  return {
    usersStore,
    requestState: requestState as Ref<RequestState>,
    users,
    currentUser,
    summary,
    load
  }
}
