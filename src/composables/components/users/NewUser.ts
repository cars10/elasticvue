import { computed, ref } from 'vue'
import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { buildUserBody, emptyUserForm, useUserRoles } from './UserForm'

export const useNewUser = (emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const user = ref(emptyUserForm())
  const { filteredRoleOptions, rolesLoading, filterRoles, resetRoleOptions } = useUserRoles(dialog)

  const formValid = computed(
    () => user.value.username.trim().length > 0 && user.value.password.length > 0 && user.value.roles.length > 0
  )

  const resetForm = () => {
    user.value = emptyUserForm()
    resetRoleOptions()
  }

  const { run, loading } = defineElasticsearchRequest({ emit })
  const createUser = async () => {
    const username = user.value.username.trim()
    const success = await run({
      request: (es) =>
        es.securityUserPut({
          username,
          body: buildUserBody(user.value, { includePassword: true })
        }),
      snackbarOptions: {
        body: t('cluster_users.new_user.create_user.growl', { username })
      }
    })
    if (success) dialog.value = false
  }

  return {
    dialog,
    user,
    formValid,
    loading,
    rolesLoading,
    filteredRoleOptions,
    createUser,
    resetForm,
    filterRoles
  }
}
