import { useTranslation } from '../../i18n'
import { ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'
import { useSnackbar } from '../../Snackbar'

export type EsSnapshot = {
  id: string,
  repository: string,
  status: string,
  start_epoch: string,
  start_time: string,
  end_time: string,
  end_epoch: string,
  duration: string,
  indices: string,
  successful_shards: string,
  failed_shards: string,
  total_shards: string
}

export type SnapshotRowProps = {
  snapshot: EsSnapshot,
  repository: string
}

export const useSnapshotRow = (props: SnapshotRowProps, emit: any) => {
  const t = useTranslation()

  let indexNamesLoaded = false
  const indexNames = ref([])

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const load = () => {
    if (indexNamesLoaded) return
    callElasticsearch('getSnapshot', { repository: props.repository, snapshot: props.snapshot.id }).then(body => {
      indexNamesLoaded = true
      indexNames.value = body.snapshots[0].indices.sort()
    }).catch(() => showSnackbar(requestState.value))
  }

  const { run } = defineElasticsearchRequest({ emit, method: 'snapshotDelete' })
  const deleteSnapshot = () => {
    return run({
      confirmMsg: t('snapshots.snapshot.delete.confirm', { snapshot: props.snapshot.id }),
      params: { repository: props.repository, snapshot: props.snapshot.id },
      snackbarOptions: { body: t('snapshots.snapshot.delete.growl', { snapshot: props.snapshot.id }) }
    })
  }

  return {
    load,
    indexNames,
    deleteSnapshot
  }
}