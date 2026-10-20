import { computed } from 'vue'
import { useTranslation } from '../../i18n.ts'
import { genColumns } from '../../../helpers/tableColumns.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { useRolesStore } from '../../../store/roles.ts'
import type { ClusterRole, RoleUsage } from '../../../types/security.ts'
import { supportsRoleDescription } from '../../../helpers/securitySupport.ts'

export type RolesTableProps = {
  roles: ClusterRole[]
  usage: Record<string, RoleUsage>
  usageKnown: boolean
}

export const useRolesTable = (props: RolesTableProps) => {
  const t = useTranslation()
  const rolesStore = useRolesStore()

  const results = computed(() => props.roles)
  const showDescription = supportsRoleDescription()

  const filteredResults = computed(() => {
    const columns = showDescription ? ['name', 'description', 'cluster'] : ['name', 'cluster']
    return filterItems(results.value, rolesStore.filter, columns)
  })

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = computed(() =>
    genColumns([
      { label: '' },
      { label: t('cluster_roles.roles_table.table.headers.name'), field: 'name', align: 'left' },
      { label: t('cluster_roles.roles_table.table.headers.cluster'), field: 'cluster', align: 'left' },
      props.usageKnown ? { label: t('cluster_roles.roles_table.table.headers.assigned'), align: 'left' } : null,
      { label: t('cluster_roles.roles_table.table.headers.status'), align: 'left' },
      { label: '' }
    ])
  )

  return {
    filteredResults,
    filterStateProps,
    columns,
    showDescription
  }
}
