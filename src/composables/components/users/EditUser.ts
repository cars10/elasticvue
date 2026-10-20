import { computed, ref } from 'vue'
import { useTranslation } from '../../i18n'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import type { ClusterUser } from '../../../types/security.ts'
import { buildUserBody, emptyUserForm, useUserRoles } from './UserForm'

export const useEditUser = (emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const reserved = ref(false)
  const user = ref(emptyUserForm())
  const { filteredRoleOptions, rolesLoading, filterRoles, resetRoleOptions } = useUserRoles(dialog)

  const formValid = computed(() => {
    if (reserved.value) return user.value.password.length > 0
    return user.value.username.trim().length > 0 && user.value.roles.length > 0
  })

  const resetForm = () => {
    user.value = emptyUserForm()
    reserved.value = false
    resetRoleOptions()
  }

  const openDialog = (clusterUser: ClusterUser) => {
    reserved.value = clusterUser.reserved
    user.value = {
      username: clusterUser.username,
      password: '',
      roles: [...clusterUser.roles],
      full_name: clusterUser.full_name,
      email: clusterUser.email,
      enabled: clusterUser.enabled
    }
    dialog.value = true
  }

  const { run: runUserPut, loading: putLoading } = defineElasticsearchRequest({ emit, method: 'securityUserPut' })
  const { run: runPasswordPut, loading: passwordLoading } = defineElasticsearchRequest({
    emit,
    method: 'securityUserPutPassword'
  })

  const loading = computed(() => putLoading.value || passwordLoading.value)

  const updateUser = async () => {
    const username = user.value.username.trim()
    const snackbarOptions = { body: t('cluster_users.edit_user.update_user.growl', { username }) }

    const success = reserved.value
      ? await runPasswordPut({
          params: { username, body: { password: user.value.password } },
          snackbarOptions
        })
      : await runUserPut({
          params: {
            username,
            body: buildUserBody(user.value, { includePassword: user.value.password.length > 0 })
          },
          snackbarOptions
        })

    if (success) dialog.value = false
  }

  return {
    dialog,
    user,
    reserved,
    formValid,
    loading,
    rolesLoading,
    filteredRoleOptions,
    openDialog,
    updateUser,
    resetForm,
    filterRoles
  }
}
