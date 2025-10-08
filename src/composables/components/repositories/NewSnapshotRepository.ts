import { useTranslation } from '../../i18n'
import { computed, Ref, ref, watch } from 'vue'
import { defineElasticsearchRequest } from '../../CallElasticsearch'

export enum RepositoryType {
  fs = 'fs',
  s3 = 's3'
}

type NewRepository = {
  repository: string
} & (FsRepository | S3Repository)

type BaseRepositorySettings = {
  compress: boolean
  chunkSize?: string
  maxRestoreBytesPerSec: string
  maxSnapshotBytesPerSec: string
  readonly: boolean
}

type FsRepository = {
  body: {
    type: RepositoryType.fs
    settings: {
      location: string
    } & BaseRepositorySettings
  }
}

export enum RepositoryProtocol {
  http = 'http',
  https = 'https'
}

type S3Repository = {
  body: {
    type: RepositoryType.s3
    settings: {
      bucket: string
      client: string
      endpoint: string
      region: string
      protocol: RepositoryProtocol
      path_style_access: boolean
    } & BaseRepositorySettings
  }
}

export const useNewSnapshotRepository = (emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const repository: Ref<NewRepository> = ref({
    repository: '',
    body: {
      type: RepositoryType.fs,
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
    return (
      repository.value.repository.trim().length > 0 &&
      ((repository.value.body.type === RepositoryType.fs && repository.value.body.settings.location?.trim()?.length > 0) ||
        (repository.value.body.type === RepositoryType.s3 && repository.value.body.settings.bucket?.trim()?.length > 0))
    )
  })

  const resetForm = (type: RepositoryType, name: string) => {
    if (type === RepositoryType.fs) {
      repository.value = {
        repository: name,
        body: {
          type: RepositoryType.fs,
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
    } else if (type === RepositoryType.s3) {
      repository.value = {
        repository: name,
        body: {
          type: RepositoryType.s3,
          settings: {
            bucket: '',
            client: '',
            endpoint: '',
            region: '',
            protocol: RepositoryProtocol.https,
            path_style_access: false,
            compress: true,
            chunkSize: '5tb',
            maxRestoreBytesPerSec: '40mb',
            maxSnapshotBytesPerSec: '40mb',
            readonly: false
          }
        }
      }
    }
  }

  resetForm(RepositoryType.fs, '')
  const hide = () => resetForm(RepositoryType.fs, '')
  watch(
    () => repository.value.body.type,
    (newValue) => resetForm(newValue, repository.value.repository)
  )

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'snapshotCreateRepository' })
  const createRepository = async () => {
    const params = Object.assign({}, repository.value)
    if (params.body.settings.chunkSize?.length === 0) delete params.body.settings.chunkSize

    const success = await run({
      params,
      snackbarOptions: {
        body: t('repositories.new_repository.create_repository.growl', { repositoryName: repository.value.repository })
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
    hide,
    createRepository
  }
}
