import { computed } from 'vue'
import { useTranslation } from '../../i18n.ts'
import { genColumns } from '../../../helpers/tableColumns.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { useUsersStore } from '../../../store/users.ts'
import type { ClusterUser } from '../../../types/security.ts'

export type UsersTableProps = {
  users: ClusterUser[]
}

export const useUsersTable = (props: UsersTableProps) => {
  const t = useTranslation()
  const usersStore = useUsersStore()

  const results = computed(() => props.users)
  const filteredResults = computed(() => {
    return filterItems(results.value, usersStore.filter, ['username', 'full_name', 'email', 'roles'])
  })

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: t('cluster_users.users_table.table.headers.user'), field: 'username', align: 'left' },
    { label: t('cluster_users.users_table.table.headers.roles'), field: 'roles', align: 'left' },
    { label: t('cluster_users.users_table.table.headers.status'), align: 'left' },
    { label: '' }
  ])

  return {
    filteredResults,
    filterStateProps,
    columns
  }
}
