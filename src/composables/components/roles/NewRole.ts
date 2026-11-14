import { computed, ref } from 'vue'
import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { buildRoleBody, emptyRoleForm, isValidIndicesJson } from './RoleForm'

export const useNewRole = (emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const role = ref(emptyRoleForm())

  const formValid = computed(() => role.value.name.trim().length > 0 && isValidIndicesJson(role.value.indicesJson))

  const resetForm = () => {
    role.value = emptyRoleForm()
  }

  const { run, loading } = defineElasticsearchRequest({ emit })
  const createRole = async () => {
    const name = role.value.name.trim()
    const success = await run({
      request: (es) =>
        es.securityRolePut({
          name,
          body: buildRoleBody(role.value)
        }),
      snackbarOptions: {
        body: t('cluster_roles.new_role.create_role.growl', { name })
      }
    })
    if (success) dialog.value = false
  }

  return {
    dialog,
    role,
    formValid,
    loading,
    createRole,
    resetForm
  }
}
