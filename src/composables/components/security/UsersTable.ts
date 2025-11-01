import { onMounted, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'
import { handleError } from '../../../helpers/error'
import { useTranslation } from '../../i18n'
import { genColumns } from '../../../helpers/tableColumns'
import { useUsersStore } from '../../../store/users'

export const useUsersTable = ( emit: any) => {

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
    { label: 'Username', field: 'username', align: 'left' },
    { label: 'Roles', field: 'roles', align: 'left' },
    // { label: 'Enabled', field: 'enabled', align: 'left' },
    { label: 'Actions', field: 'actions', align: 'right' }
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

      // users.value = Object.keys(response).map(username => ({
      //   username,
      //   ...response[username]
      // }))
    } catch (e) {
      handleError(e)
    }
  }
  
  
  const toggleUserEnabled = async (user: any) => {
    try {
      // await callElasticsearch('updateUser', {
      //   username: user.username,
      //   body: { enabled: user.enabled, roles: user.roles }
      // })
      // showSnackbar({
      //   body: `User "${user.username}" ${user.enabled ? 'enabled' : 'disabled'} successfully.`
      // })
    } catch (e) {
      handleError(e)
      // Revert the toggle if the API call fails
      user.enabled = !user.enabled
    }
  }

  const { run } = defineElasticsearchRequest({ emit, method: 'deleteUser' })

  const deleteUser = async (id:string) => {

      return run({
      params: {
        id: id
        },
      confirmMsg: t('users.users_result.delete.confirm', 1),
      snackbarOptions: { body: t('users.apiKeys_result.delete.growl', 1) }
    })
  }

  onMounted(loadUsers)
  return {
    users,
    columns,
    deleteUser,
    toggleUserEnabled,
    rowsPerPage,
    acceptRowsPerPage,
    usersStore
  }
}