import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { filterItems } from '../../../helpers/filters'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { genColumns } from '../../../helpers/tableColumns'
import { setupFilterState } from '../shared/FilterState.ts'
import type { SnapshotPolicy, EmitFunction } from '../../../types/snapshotPolicies'

export type EsSnapshotPolicy = {
  version: number
  modified_date: string
  modified_date_millis: number
  policy: SnapshotPolicy & { name: string }
}

export type SnapshotPoliciesTableProps = {
  policies: Record<string, EsSnapshotPolicy>
}

export const useSnapshotPoliciesTable = (props: SnapshotPoliciesTableProps, emit: EmitFunction) => {
  const t = useTranslation()

  const filter = ref('')
  const editingPolicyName = ref('')

  const results = computed(() => Object.entries(props.policies))
  const filteredResults = computed(() => {
    if (results.value.length === 0) return []
    const policies = results.value.map(([name, policy]) => ({
      name,
      schedule: policy.policy.schedule,
      repository: policy.policy.repository,
      retention: policy.policy.retention ? 
        (policy.policy.retention.expire_after || `${policy.policy.retention.max_count || 'N/A'} snapshots`) : 
        'No retention'
    }))
    return filterItems(policies, filter.value, ['name'])
  })

  const { run: deleteRun } = defineElasticsearchRequest({ 
    emit: (event: string) => emit(event as 'reload'), 
    method: 'slmDeletePolicy' 
  })
  const { run: executeRun } = defineElasticsearchRequest({ 
    emit: (event: string) => emit(event as 'reload'), 
    method: 'slmExecutePolicy' 
  })

  const deletePolicy = (name: string) => {
    return deleteRun({
      confirmMsg: t('snapshot_policies.policies_table.delete_policy.confirm', { name }),
      params: { policy: name },
      snackbarOptions: { body: t('snapshot_policies.policies_table.delete_policy.growl', { name }) }
    })
  }

  const executePolicy = (name: string) => {
    return executeRun({
      confirmMsg: t('snapshot_policies.policies_table.execute_policy.confirm', { name }),
      params: { policy: name },
      snackbarOptions: { body: t('snapshot_policies.policies_table.execute_policy.growl', { name }) }
    })
  }

  const editPolicy = (name: string) => {
    editingPolicyName.value = name
  }

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: t('snapshot_policies.policies_table.table.headers.name'), field: 'name' },
    { label: t('snapshot_policies.policies_table.table.headers.schedule'), field: 'schedule' },
    { label: t('snapshot_policies.policies_table.table.headers.repository'), field: 'repository' },
    { label: t('snapshot_policies.policies_table.table.headers.retention'), field: 'retention' },
    { label: '' }
  ])

  return {
    emit,
    editPolicy,
    executePolicy,
    filter,
    filteredResults,
    filterStateProps,
    deletePolicy,
    columns,
    editingPolicyName
  }
}
