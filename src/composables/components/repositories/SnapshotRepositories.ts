import { computed, onMounted, Ref, shallowRef } from 'vue'
import { RequestState, useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useSnapshotRepositoriesStore } from '../../../store/snapshot_repositories.ts'
import {
  mapRepositories,
  mapSlmPolicies,
  REPOSITORIES_PARAMS,
  runningSnapshots,
  SLM_POLICIES_PARAMS,
  SNAPSHOT_STATUS_PARAMS,
  summarizeRepositories
} from '../../../helpers/snapshots.ts'
import { supportsSlm } from '../../../helpers/snapshotSupport.ts'
import type {
  EsSnapshotPolicy,
  EsSnapshotRepository,
  EsSnapshotStatusList,
  RepositoryRow,
  RunningSnapshot,
  SlmPolicy
} from '../../../types/snapshots.ts'

export const useSnapshotRepositories = () => {
  const snapshotRepositoriesStore = useSnapshotRepositoriesStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()

  const slm = supportsSlm()
  const repositories = shallowRef<RepositoryRow[]>([])
  const policies = shallowRef<SlmPolicy[] | null>(null)
  const running = shallowRef<RunningSnapshot[] | null>(null)
  const summary = computed(() => summarizeRepositories(repositories.value, policies.value || []))

  const load = async () => {
    const [repositoriesResult, statusResult, policiesResult] = await Promise.allSettled([
      callElasticsearch('catRepositories', REPOSITORIES_PARAMS) as Promise<Record<string, EsSnapshotRepository>>,
      callEnrichment('snapshotStatus', {}, SNAPSHOT_STATUS_PARAMS) as Promise<EsSnapshotStatusList>,
      slm ? (callEnrichment('catSlmPolicies', SLM_POLICIES_PARAMS) as Promise<Record<string, EsSnapshotPolicy>>) : null
    ])

    policies.value = policiesResult.status === 'fulfilled' && policiesResult.value ? mapSlmPolicies(policiesResult.value) : null
    running.value = statusResult.status === 'fulfilled' ? runningSnapshots(statusResult.value) : null
    repositories.value =
      repositoriesResult.status === 'fulfilled' ? mapRepositories(repositoriesResult.value, policies.value || []) : []
  }

  onMounted(load)

  return {
    snapshotRepositoriesStore,
    requestState: requestState as Ref<RequestState>,
    repositories,
    policies,
    running,
    summary,
    slm,
    load
  }
}
