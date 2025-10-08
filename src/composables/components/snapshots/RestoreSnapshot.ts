import { useTranslation } from '../../i18n'
import { computed, Ref, ref, watch } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'

export type RestoreSnapshotProps = {
  repository: string
  snapshot: string
}

export const useRestoreSnapshot = (props: RestoreSnapshotProps, emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const indexNames = ref([])
  const restoreOptions = ref({
    indices: [],
    ignoreUnavailable: true,
    includeGlobalState: true,
    renamePattern: '',
    renameReplacement: ''
  })
  const formValid = computed(() => restoreOptions.value.indices.length > 0)

  const { callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<any> = ref(null)

  const load = () => {
    return callElasticsearch('getSnapshot', { repository: props.repository, snapshot: props.snapshot })
      .then((body) => (data.value = body))
      .catch(() => (data.value = null))
  }

  watch(dialog, (newValue) => {
    if (newValue) load().then(() => (indexNames.value = data.value.snapshots[0].indices.sort()))
  })

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

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'snapshotRestore' })
  const restoreSnapshot = async () => {
    const success = await run({
      params: {
        repository: props.repository,
        snapshot: props.snapshot,
        body: {
          indices: restoreOptions.value.indices,
          ignore_unavailable: restoreOptions.value.ignoreUnavailable,
          include_global_state: restoreOptions.value.includeGlobalState,
          rename_pattern: restoreOptions.value.renamePattern,
          rename_replacement: restoreOptions.value.renameReplacement
        }
      },
      snackbarOptions: {
        body: t('snapshots.restore_snapshot.restore_snapshot.growl', { snapshot: props.snapshot })
      }
    })
    if (success) dialog.value = false
  }

  return {
    dialog,
    restoreOptions,
    indexNames,
    loading,
    formValid,
    restoreSnapshot,
    resetForm
  }
}
