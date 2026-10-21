import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import type { SnapshotRow } from '../../../types/snapshots.ts'

export type SnapshotRowProps = {
  snapshot: SnapshotRow
  repository: string
}

export const useSnapshotRow = (props: SnapshotRowProps, emit: any) => {
  const t = useTranslation()

  const { run } = defineElasticsearchRequest({ emit, method: 'snapshotDelete' })
  const deleteSnapshot = () => {
    return run({
      confirmMsg: t('snapshots.snapshot.delete.confirm', { snapshot: props.snapshot.name }),
      params: { repository: props.repository, snapshot: props.snapshot.name },
      snackbarOptions: { body: t('snapshots.snapshot.delete.growl', { snapshot: props.snapshot.name }) }
    })
  }

  return {
    deleteSnapshot
  }
}
