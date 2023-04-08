import { useTranslation } from '../../i18n'
import { computed, Ref, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'

type Repository = {
  repository: string,
  body: RepositoryOptions
}

type RepositoryOptions = {
  type: string,
  settings: RepositorySettings
}

type RepositorySettings = {
  location: string,
  compress: boolean,
  chunkSize: string,
  maxRestoreBytesPerSec: string,
  maxSnapshotBytesPerSec: string,
  readonly: boolean
}

export const useNewSnapshotRepository = ({ emit }: { emit: any }) => {
  const t = useTranslation()

  const dialog = ref(false)
  const repository: Ref<Repository> = ref({
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
  const { requestState } = useElasticsearchAdapter()

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

  const closeDialog = () => {
    resetForm()
    dialog.value = false
  }

  const callCreate = defineElasticsearchRequest({ emit, method: 'snapshotCreateRepository' })
  const createRepository = async () => {
    const success = await callCreate({
      params: repository.value,
      snackbarOptions: {
        body: t('repositories.new_repository.create_repository.growl', { repositoryName: repository.value.repository }),
      }
    })
    if (success) closeDialog()
  }

  return {
    repository,
    resetForm,
    dialog,
    formValid,
    requestState,
    createRepository
  }
}