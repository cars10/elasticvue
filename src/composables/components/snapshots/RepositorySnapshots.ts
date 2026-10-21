import { computed, onMounted, Ref, shallowRef } from 'vue'
import { RequestState, useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useSnapshotsStore } from '../../../store/snapshots.ts'
import {
  mapSnapshots,
  runningSnapshots,
  SNAPSHOT_STATUS_PARAMS,
  SNAPSHOTS_PARAMS,
  summarizeSnapshots
} from '../../../helpers/snapshots.ts'
import type { EsSnapshotList, EsSnapshotStatusList, RunningSnapshot, SnapshotRow } from '../../../types/snapshots.ts'

export const useRepositorySnapshots = (repository: string) => {
  const snapshotsStore = useSnapshotsStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()

  const snapshots = shallowRef<SnapshotRow[]>([])
  const running = shallowRef<RunningSnapshot[] | null>(null)
  const summary = computed(() => summarizeSnapshots(snapshots.value))

  const load = async () => {
    const [snapshotsResult, statusResult] = await Promise.allSettled([
      callElasticsearch('catSnapshots', { repository }, SNAPSHOTS_PARAMS) as Promise<EsSnapshotList>,
      callEnrichment('snapshotStatus', { repository }, SNAPSHOT_STATUS_PARAMS) as Promise<EsSnapshotStatusList>
    ])

    snapshots.value = snapshotsResult.status === 'fulfilled' ? mapSnapshots(snapshotsResult.value) : []
    running.value = statusResult.status === 'fulfilled' ? runningSnapshots(statusResult.value) : null
  }

  onMounted(load)

  return {
    snapshotsStore,
    requestState: requestState as Ref<RequestState>,
    snapshots,
    running,
    summary,
    load
  }
}
