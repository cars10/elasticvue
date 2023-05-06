import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'

export const useRestoreSnapshot = ({ emit, repository, snapshot }: {
  emit: any,
  repository: string,
  snapshot: string
}) => {
  const t = useTranslation()

  const dialog = ref(false)
  const restoreOptions = ref({
    indices: [],
    ignoreUnavailable: true,
    includeGlobalState: true,
    renamePattern: '',
    renameReplacement: ''
  })
  const formValid = computed(() => (restoreOptions.value.indices.length > 0))
  const { requestState } = useElasticsearchAdapter()

  const resetForm = () => {
    restoreOptions.value = {
      indices: [],
      ignoreUnavailable: true,
      includeGlobalState: true,
      renamePattern: '',
      renameReplacement: ''
    }
  }
  resetForm()

  const callRestore = defineElasticsearchRequest({ emit, method: 'snapshotRestore' })
  const restoreSnapshot = async () => {
    const success = await callRestore({
      params: {
        repository,
        snapshot,
        body: {
          indices: restoreOptions.value.indices,
          ignore_unavailable: restoreOptions.value.ignoreUnavailable,
          include_global_state: restoreOptions.value.includeGlobalState,
          rename_pattern: restoreOptions.value.renamePattern,
          rename_replacement: restoreOptions.value.renameReplacement
        }
      },
      snackbarOptions: {
        body: t('snapshots.restore_snapshot.restore_snapshot.growl', { snapshot }),
      }
    })
    if (success) dialog.value = false
  }

  return {
    dialog,
    restoreOptions,
    formValid,
    requestState,
    restoreSnapshot,
    resetForm
  }
}