import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import type { ClusterRole } from '../../../types/security.ts'

export type RoleRowProps = {
  role: ClusterRole
}

export const useRoleRow = (props: RoleRowProps, emit: any) => {
  const t = useTranslation()

  const { run } = defineElasticsearchRequest({ emit, method: 'securityRoleDelete' })
  const deleteRole = () => {
    return run({
      confirmMsg: t('cluster_roles.role.delete.confirm', { name: props.role.name }),
      params: { name: props.role.name },
      snackbarOptions: { body: t('cluster_roles.role.delete.growl', { name: props.role.name }) }
    })
  }

  return {
    deleteRole
  }
}
