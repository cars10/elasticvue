import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'

export type EsSnapshotList = {
  snapshots: EsSnapshot[]
}

export type EsSnapshot = {
  snapshot: string,
  repository: string,
  state: string,
  start_time_in_millis: number,
  start_time: string,
  end_time: string,
  end_time_in_millis: number,
  duration_in_millis: number,
  indices: string[],
  shards: {
    successful: number,
    failed: number,
    total: number
  }
}

export type SnapshotRowProps = {
  snapshot: EsSnapshot,
  repository: string
}

export const useSnapshotRow = (props: SnapshotRowProps, emit: any) => {
  const t = useTranslation()

  const { run } = defineElasticsearchRequest({ emit, method: 'snapshotDelete' })
  const deleteSnapshot = () => {
    return run({
      confirmMsg: t('snapshots.snapshot.delete.confirm', { snapshot: props.snapshot.snapshot }),
      params: { repository: props.repository, snapshot: props.snapshot.snapshot },
      snackbarOptions: { body: t('snapshots.snapshot.delete.growl', { snapshot: props.snapshot.snapshot }) }
    })
  }

  return {
    deleteSnapshot
  }
}