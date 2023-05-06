import { useTranslation } from '../../i18n'
import { ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'
import { useSnackbar } from '../../Snackbar'

export const useSnapshotRow = ({ emit, repository, snapshot }: { emit: any, repository: string, snapshot: string }) => {
  const t = useTranslation()

  let indexNamesLoaded = false
  const indexNames = ref([])

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const load = () => {
    if (indexNamesLoaded) return
    callElasticsearch('getSnapshot', { repository, snapshot }).then(body => {
      indexNamesLoaded = true
      indexNames.value = body.snapshots[0].indices.sort()
    }).catch(() => showSnackbar(requestState.value))
  }

  const callDelete = defineElasticsearchRequest({ emit, method: 'snapshotDelete' })
  const deleteSnapshot = () => {
    return callDelete({
      confirmMsg: t('snapshots.snapshot.delete.confirm', { snapshot }),
      params: { repository, snapshot },
      snackbarOptions: { body: t('snapshots.snapshot.delete.growl', { snapshot }) }
    })
  }

  return {
    load,
    indexNames,
    deleteSnapshot
  }
}