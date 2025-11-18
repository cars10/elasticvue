import { onMounted, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'
import { handleError } from '../../../helpers/error'
import { useTranslation } from '../../i18n'
import { genColumns } from '../../../helpers/tableColumns'
import { useUsersStore } from '../../../store/users'
import { AuthType, useConnectionStore } from '../../../store/connection'

export const useUsersTable = ( emit: any) => {

  const connectionStore = useConnectionStore()
  const usersStore = useUsersStore()
  const { callElasticsearch } = useElasticsearchAdapter()
  const users = ref<User[]>([])
  const t = useTranslation()

  const rowsPerPage = [
    { label: '10', value: 10, enabled: true },
    { label: '20', value: 20, enabled: true },
    { label: '100', value: 100, enabled: true },
    { label: '1000', value: 1000, enabled: usersStore.rowsPerPageAccepted, needsConfirm: true }
  ]

  const acceptRowsPerPage = (value: boolean) => (usersStore.rowsPerPageAccepted = value)

  const columns = genColumns([
    { label: t('security.table.username'), field: 'username', align: 'left' },
    { label: t('security.table.roles'), field: 'roles', align: 'left' },
    { label: 'Enabled', field: 'enabled', align: 'left' },
    { label: t('security.table.actions'), field: 'actions', align: 'right' }
  ])

  
  class User{
    username:string
    roles:string
    enabled:boolean
  }


  const loadUsers = async () => {
    try {
      const response = await callElasticsearch('getUsers')

      const data = Object.keys(response).map(username => {
        let d : User
        const roleData = response[username]
        const roles = roleData.roles.join('<br />')
        const enabled = roleData.enabled

        d = new User()
        d = {
          username,
          roles,
          enabled
        }
        return  d
      })
      users.value = data 
    } catch (e) {
      handleError(e)
    }
  }
  
  const isCurrentUser = (username:string) => {
    const currentUser = connectionStore.activeCluster?.auth.authType === AuthType.basicAuth ?
     connectionStore.activeCluster?.auth.authData.username : 
     null
    if (currentUser!== null) {
      return currentUser === username
    } else {
      return false
    }
  }
  
  const toggleUserEnabled = async (user: User) => {
    const existingUser = users.value.find(u => u.username === user.username)

    if (existingUser!== undefined) {
      try {      
        await callElasticsearch(existingUser.enabled ? 'enableUser' : 'disableUser', {
            username: existingUser.username
          })

        loadUsers()

      } catch (e) {
        handleError(e,true) 
        if (existingUser!== undefined)
          existingUser.enabled = !existingUser.enabled
      }
    }
  }

  const deleteUser = async (username:string) => {
    try {
      const { run } = defineElasticsearchRequest({ emit, method: 'deleteUser' })
      const result = await run({
        params: {
          username: username
        },
        confirmMsg: t('security.users_result.delete.confirm', { name: username }),
        snackbarOptions: { body: t('security.users_result.delete.growl',  { name: username }) }
      })
      
      if (result !== true) {
        throw new Error(t('security.users_result.error.delete_failed', { name: username }))
      }

      // Suppression des API keys associées à l'utilisateur APRÈS la suppression effective de l'utilisateur
      try {
        const apiKeysResponse = await callElasticsearch('getApiKeys')
        const apiKeys = apiKeysResponse.api_keys || []
        const userApiKeys = apiKeys.filter((key: any) => key.username === username)
        for (const key of userApiKeys) {
          try {
            await callElasticsearch('deleteApiKey', { id: key.id })
          } catch (e) {
            handleError(e,true)
          }
        }
      } catch (e) {
        handleError(e,true)
      }

      loadUsers()
      emit('deleted')
    } catch (e) {
      handleError(e,true)
    }
  }

  onMounted(loadUsers)

  const createUser = async (username : string, roles: string[], password: string) => {

    try {
      const existingUser = users.value.find(u => u.username === username)
      if (existingUser!== undefined) {
        throw new Error(t('security.users_result.error.add_failed', { name: username }))
      }

      const { run } = defineElasticsearchRequest({ emit, method: 'createUser' })
      const result = await run({
        params: {
          username : username,
          body: {
            username,
            roles,
            password
          }
        },
        snackbarOptions: { body: t('security.users_result.created.growl',  { name: username }) }
        })
        

      if (result !== true) {
        throw new Error(t('security.users_result.error.add_failed', { name: username }))
      }
      
      loadUsers()

      emit('created')
    } catch (e) {
      handleError(e,true)
    }
  }

  return {
    users,
    columns,
    loadUsers,
    createUser,
    deleteUser,
    toggleUserEnabled,
    rowsPerPage,
    acceptRowsPerPage,
    usersStore,
    isCurrentUser
  }
}