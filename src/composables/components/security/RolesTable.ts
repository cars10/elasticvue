import { onMounted, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'
import { handleError } from '../../../helpers/error'
import { useTranslation } from '../../i18n'
import { genColumns } from '../../../helpers/tableColumns'
import { useRolesStore } from '../../../store/roles'

export const useRolesTable = (emit: any) => {

  const rolesStore = useRolesStore()

  const { callElasticsearch } = useElasticsearchAdapter()
  const roles = ref<Role[]>([])
  const t = useTranslation()


  const rowsPerPage = [
    { label: '10', value: 10, enabled: true },
    { label: '20', value: 20, enabled: true },
    { label: '100', value: 100, enabled: true },
    { label: '1000', value: 1000, enabled: rolesStore.rowsPerPageAccepted, needsConfirm: true }
  ]

  const acceptRowsPerPage = (value: boolean) => (rolesStore.rowsPerPageAccepted = value)

  const columns = genColumns( [
    { label: 'Name', field: 'name', align: 'left'},
    { label: 'Cluster', field: 'cluster', align: 'left'},
    { label: 'Indices', field: 'indices', align: 'left' },
    { label: 'Actions', field: 'actions', align: 'right' }
  ])
 

  class Role{
    name:string
    cluster:string
    indices:string
  }

  const loadRoles = async () => {
    try {
      const response = await callElasticsearch('getRoles')

      const data = Object.keys(response).map(name => {
        let d : Role
        const roleData = response[name]
        const indices = roleData.indices.map((i: any) => i.names.join('<br />')).join('<br />')
        const cluster = roleData.cluster.join('<br />')

        d = new Role()
        d = {
          name,
          cluster,
          indices
        }
        return  d
      })
      roles.value = data 
    } catch (e) {
      handleError(e)
    }
  }

  const { run } = defineElasticsearchRequest({ emit, method: 'deleteRole' })

  const deleteRole = async (id:string) => {

   return run({
      params:  ({
        id: id
        }),
      confirmMsg: t('roles.roles_result.delete.confirm', 1),
      snackbarOptions: { body: t('roles.apiKeys_result.delete.growl', 1) }
    })
}

onMounted(loadRoles)
 return {
    roles,
    columns,
    deleteRole,
    loadRoles,
    rowsPerPage,
    acceptRowsPerPage,
    rolesStore
  }
}