import { ref, useTemplateRef, watch } from 'vue'
import { useTranslation } from '../../i18n'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { genColumns } from '../../../helpers/tableColumns'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { mapSlmPolicies, SLM_POLICIES_PARAMS } from '../../../helpers/snapshots.ts'
import type { EsSnapshotPolicy, SlmPolicy } from '../../../types/snapshots.ts'
import type EditRepositorySnapshotPolicy from '../../../components/repositories/EditRepositorySnapshotPolicy.vue'

export type RepositoryPoliciesProps = {
  repository: string
}

export const useRepositoryPolicies = (props: RepositoryPoliciesProps, emit: any) => {
  const t = useTranslation()
  const { callElasticsearch } = useElasticsearchAdapter()

  const dialog = ref(false)
  const policies = ref<SlmPolicy[]>([])
  const selectedPolicyId = ref('')
  const editDialog = useTemplateRef<typeof EditRepositorySnapshotPolicy>('editDialog')

  watch(dialog, (value) => {
    if (value) {
      loadPolicies()
    } else {
      emit('reload')
    }
  })

  const loadPolicies = () => {
    callElasticsearch('catSlmPolicies', SLM_POLICIES_PARAMS)
      .then((body: Record<string, EsSnapshotPolicy>) => {
        policies.value = mapSlmPolicies(body).filter((policy) => policy.repository === props.repository)
      })
      .catch(() => (policies.value = []))
  }

  const { run: executeRun } = defineElasticsearchRequest({ emit, method: 'slmExecutePolicy' })
  const { run: deleteRun } = defineElasticsearchRequest({ emit, method: 'slmDeletePolicy' })

  const executePolicy = (name: string) => {
    return executeRun({
      confirmMsg: t('snapshot_policies.policies_table.execute_policy.confirm', { name }),
      params: { policy: name },
      snackbarOptions: { body: t('snapshot_policies.policies_table.execute_policy.growl', { name }) }
    }).then(() => loadPolicies())
  }

  const deletePolicy = (name: string) => {
    return deleteRun({
      confirmMsg: t('snapshot_policies.policies_table.delete_policy.confirm', { name }),
      params: { policy: name },
      snackbarOptions: { body: t('snapshot_policies.policies_table.delete_policy.growl', { name }) }
    }).then(() => loadPolicies())
  }

  const editPolicy = (name: string) => {
    selectedPolicyId.value = name
    if (editDialog.value) {
      editDialog.value.openDialog()
    }
  }

  const columns = genColumns([
    { label: t('snapshot_policies.policies_table.table.headers.id'), field: 'id' },
    { label: t('snapshot_policies.policies_table.table.headers.name'), field: 'name' },
    { label: t('snapshot_policies.policies_table.table.headers.schedule'), field: 'schedule' },
    { label: t('snapshot_policies.policies_table.table.headers.retention'), field: 'retention' },
    { label: t('snapshot_policies.policies_table.table.headers.last_run'), field: 'lastSuccess' },
    { label: t('snapshot_policies.policies_table.table.headers.next_run'), field: 'nextRun' },
    { label: '' }
  ])

  return {
    dialog,
    policies,
    loadPolicies,
    executePolicy,
    editPolicy,
    deletePolicy,
    columns,
    selectedPolicyId,
    editDialog
  }
}
