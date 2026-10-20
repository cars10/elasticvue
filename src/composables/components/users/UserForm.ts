import { computed, ref, watch } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { supportsUserEnabledInBody } from '../../../helpers/securitySupport.ts'
import { ROLE_NAMES_PARAMS } from '../../../helpers/security.ts'

export type UserFormData = {
  username: string
  password: string
  roles: string[]
  full_name: string
  email: string
  enabled: boolean
}

export const emptyUserForm = (): UserFormData => ({
  username: '',
  password: '',
  roles: [],
  full_name: '',
  email: '',
  enabled: true
})

export const useUserRoles = (dialog: { value: boolean }) => {
  const roleOptions = ref<string[]>([])
  const filteredRoleOptions = ref<string[]>([])
  const { callElasticsearch, requestState: rolesRequestState } = useElasticsearchAdapter()

  const loadRoles = async () => {
    try {
      const roles = await callElasticsearch('securityRoles', ROLE_NAMES_PARAMS)
      roleOptions.value = Object.keys(roles || {}).sort()
    } catch (_e) {
      roleOptions.value = []
    }
    filteredRoleOptions.value = roleOptions.value
  }

  watch(
    () => dialog.value,
    (open) => {
      if (open) loadRoles()
    }
  )

  const filterRoles = (val: string, update: (fn: () => void) => void) => {
    if (!val) {
      update(() => (filteredRoleOptions.value = roleOptions.value))
      return
    }

    const search = val.toLowerCase()
    update(() => {
      filteredRoleOptions.value = roleOptions.value.filter((role) => role.toLowerCase().includes(search))
    })
  }

  const resetRoleOptions = () => {
    filteredRoleOptions.value = roleOptions.value
  }

  return {
    filteredRoleOptions,
    rolesLoading: computed(() => rolesRequestState.value.loading),
    filterRoles,
    resetRoleOptions
  }
}

export const buildUserBody = (user: UserFormData, { includePassword }: { includePassword: boolean }) => {
  const body: Record<string, unknown> = {
    roles: user.roles,
    full_name: user.full_name.trim(),
    email: user.email.trim()
  }

  if (supportsUserEnabledInBody()) body.enabled = user.enabled
  if (includePassword) body.password = user.password

  return body
}
