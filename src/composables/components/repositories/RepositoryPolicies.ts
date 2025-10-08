import { ref, watch } from 'vue'
import { useTranslation } from '../../i18n'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { genColumns } from '../../../helpers/tableColumns'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { SnapshotPolicy, SnapshotPolicyRetention } from '../../../types/snapshotPolicies'

export type RepositoryPoliciesProps = {
    repository: string
}

export type EsSnapshotPolicy = {
    version: number
    modified_date: string
    modified_date_millis: number
    policy: SnapshotPolicy & { name: string }
}

export type MappedSnapshotPolicy = {
    id: string
    name: string
    schedule: string
    repository: string
    retention: SnapshotPolicyRetention | undefined
}

export const useRepositoryPolicies = (props: RepositoryPoliciesProps, emit: any) => {
    const t = useTranslation()
    const { callElasticsearch } = useElasticsearchAdapter()

    const dialog = ref(false)
    const policies = ref<MappedSnapshotPolicy[]>([])

    watch(dialog, value => {
        if (value) {
            loadPolicies()
        } else {
            emit('reload')
        }
    })

    const loadPolicies = () => {
        callElasticsearch('catSlmPolicies')
            .then((body: Record<string, EsSnapshotPolicy>) => {
                const repositoryPolicies = Object.entries(body)
                    .filter(([, policy]) => policy.policy.repository === props.repository)
                    .map(([id, policy]) => ({
                        id,
                        name: policy.policy.name,
                        schedule: policy.policy.schedule,
                        repository: policy.policy.repository,
                        retention: policy.policy.retention
                    }))

                policies.value = repositoryPolicies
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

    const editPolicy = (_name: string) => {
        // This would open the edit dialog - for now just show a message
    }

    const columns = genColumns([
        { label: t('snapshot_policies.policies_table.table.headers.id'), field: 'id' },
        { label: t('snapshot_policies.policies_table.table.headers.name'), field: 'name' },
        { label: t('snapshot_policies.policies_table.table.headers.schedule'), field: 'schedule' },
        { label: t('snapshot_policies.policies_table.table.headers.retention'), field: 'retention' },
        { label: '' }
    ])

    return {
        dialog,
        policies,
        loadPolicies,
        executePolicy,
        editPolicy,
        deletePolicy,
        columns
    }
}
