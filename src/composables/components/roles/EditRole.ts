import { computed, ref } from 'vue'
import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import type { ClusterRole } from '../../../types/security.ts'
import { buildRoleBody, emptyRoleForm, isValidIndicesJson, roleFormFromClusterRole } from './RoleForm'

export const useEditRole = (emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const role = ref(emptyRoleForm())
  const existingRaw = ref<Record<string, unknown> | undefined>()

  const formValid = computed(() => role.value.name.trim().length > 0 && isValidIndicesJson(role.value.indicesJson))

  const resetForm = () => {
    role.value = emptyRoleForm()
    existingRaw.value = undefined
  }

  const openDialog = (clusterRole: ClusterRole) => {
    existingRaw.value = { ...clusterRole.raw }
    role.value = roleFormFromClusterRole(clusterRole.raw)
    dialog.value = true
  }

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'securityRolePut' })
  const updateRole = async () => {
    const name = role.value.name.trim()
    const success = await run({
      params: {
        name,
        body: buildRoleBody(role.value, existingRaw.value)
      },
      snackbarOptions: {
        body: t('cluster_roles.edit_role.update_role.growl', { name })
      }
    })
    if (success) dialog.value = false
  }

  return {
    dialog,
    role,
    formValid,
    loading,
    openDialog,
    updateRole,
    resetForm
  }
}
