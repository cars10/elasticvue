import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import type { ClusterUser } from '../../../types/security.ts'

export type UserRowProps = {
  user: ClusterUser
}

export const useUserRow = (props: UserRowProps, emit: any) => {
  const t = useTranslation()

  const { run } = defineElasticsearchRequest({ emit })
  const deleteUser = () => {
    return run({
      confirmMsg: t('cluster_users.user.delete.confirm', { username: props.user.username }),
      request: (es) => es.securityUserDelete({ username: props.user.username }),
      snackbarOptions: { body: t('cluster_users.user.delete.growl', { username: props.user.username }) }
    })
  }

  return {
    deleteUser
  }
}
