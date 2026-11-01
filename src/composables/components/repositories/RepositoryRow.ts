import { useRouter } from 'vue-router'
import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import type { RepositoryRow } from '../../../types/snapshots.ts'

export type RepositoryRowProps = {
  repository: RepositoryRow
}

export const useRepositoryRow = (props: RepositoryRowProps, emit: any) => {
  const t = useTranslation()
  const router = useRouter()

  const { run: deleteRun } = defineElasticsearchRequest({ emit })
  const deleteRepository = () => {
    const name = props.repository.name
    return deleteRun({
      confirmMsg: t('repositories.repositories_table.delete_repository.confirm', { name }),
      request: (es) => es.snapshotDeleteRepository({ repository: name }),
      snackbarOptions: { body: t('repositories.repositories_table.delete_repository.growl', { name }) }
    })
  }

  const { run: verifyRun } = defineElasticsearchRequest()
  const verifyRepository = () => {
    const name = props.repository.name
    return verifyRun({
      request: (es) => es.snapshotVerifyRepository({ repository: name }),
      snackbarOptions: (body: { nodes?: Record<string, unknown> }) => ({
        body: t('repositories.repositories_table.verify_repository.growl', {
          name,
          count: Object.keys(body?.nodes || {}).length
        })
      })
    })
  }

  const openSnapshots = () => router.push({ name: 'snapshots', params: { repositoryName: props.repository.name } })

  return {
    deleteRepository,
    verifyRepository,
    openSnapshots
  }
}
