import { useTranslation } from '../../i18n'
import { computed, Ref, ref } from 'vue'
import { defineElasticsearchRequest } from '../../CallElasticsearch'

type NewRepository = {
  repository: string,
  body: NewRepositoryOptions
}

type NewRepositoryOptions = {
  type: string,
  settings: NewRepositorySettings
}

type NewRepositorySettings = {
  location: string,
  compress: boolean,
  chunkSize: string,
  maxRestoreBytesPerSec: string,
  maxSnapshotBytesPerSec: string,
  readonly: boolean
}

export const useNewSnapshotRepository = (emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const repository: Ref<NewRepository> = ref({
    repository: '',
    body: {
      type: 'fs',
      settings: {
        location: '',
        compress: true,
        chunkSize: '',
        maxRestoreBytesPerSec: '40mb',
        maxSnapshotBytesPerSec: '40mb',
        readonly: false
      }
    }
  })

  const formValid = computed(() => {
    return repository.value.repository.trim().length > 0 && repository.value.body.settings.location.trim().length > 0
  })

  const resetForm = () => {
    repository.value = {
      repository: '',
      body: {
        type: 'fs',
        settings: {
          location: '',
          compress: true,
          chunkSize: '',
          maxRestoreBytesPerSec: '40mb',
          maxSnapshotBytesPerSec: '40mb',
          readonly: false
        }
      }
    }
  }
  resetForm()

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'snapshotCreateRepository' })
  const createRepository = async () => {
    const success = await run({
      params: repository.value,
      snackbarOptions: {
        body: t('repositories.new_repository.create_repository.growl', { repositoryName: repository.value.repository }),
      }
    })
    if (success) dialog.value = false
  }

  return {
    repository,
    resetForm,
    dialog,
    formValid,
    loading,
    createRepository
  }
}