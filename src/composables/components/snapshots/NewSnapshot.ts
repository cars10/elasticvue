import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'

type Snapshot = {
  name: string,
  indices: string | string[]
}

export const useNewSnapshot = ({ emit, repository }: { emit: any, repository: string }) => {
  const t = useTranslation()

  const dialog = ref(false)
  const snapshot = ref<Snapshot>({ name: '', indices: '*' })
  const formValid = computed(() => snapshot.value.name.trim().length > 0)

  const { requestState } = useElasticsearchAdapter()

  const resetForm = () => {
    snapshot.value = {
      name: '',
      indices: '*'
    }
  }
  resetForm()

  const callCreate = defineElasticsearchRequest({ emit, method: 'snapshotCreate' })
  const createSnapshot = async () => {
    const success = await callCreate({
      params: {
        repository,
        snapshot: snapshot.value.name,
        body: {
          indices: snapshot.value.indices
        }
      },
      snackbarOptions: {
        body: t('snapshots.new_snapshot.create_snapshot.growl', { name: snapshot.value.name }),
      }
    })
    if (success) dialog.value = false
  }

  return {
    dialog,
    snapshot,
    formValid,
    requestState,
    createSnapshot,
    resetForm
  }
}