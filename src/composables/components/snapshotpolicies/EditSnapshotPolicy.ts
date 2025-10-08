import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'
import type { SnapshotPolicyForm, SnapshotPolicyRequestBody, ElasticsearchResponse } from '../../../types/snapshotPolicies'

export const useEditSnapshotPolicy = (emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const policy = ref<SnapshotPolicyForm>({
    id: '',
    name: '',
    schedule: '',
    repository: '',
    indices: '*',
    ignoreUnavailable: false,
    includeGlobalState: true,
    retentionExpireAfter: '',
    retentionMaxCount: null,
    retentionMinCount: null
  })

  const formValid = computed(() => (
    policy.value.schedule.length > 0 &&
    policy.value.repository.length > 0
  ))

  const resetForm = () => {
    policy.value = {
      id: '',
      name: '',
      schedule: '',
      repository: '',
      indices: '*',
      ignoreUnavailable: false,
      includeGlobalState: true,
      retentionExpireAfter: '',
      retentionMaxCount: null,
      retentionMinCount: null
    }
  }

  const closeDialog = () => {
    resetForm()
    dialog.value = false
  }

  const { run, loading } = defineElasticsearchRequest({
    emit: (event: string) => emit(event as 'reload'),
    method: 'slmPutPolicy'
  })
  const { callElasticsearch } = useElasticsearchAdapter()

  const loadPolicy = async (policyId: string) => {
    try {
      const data = await callElasticsearch('slmGetPolicy', { policy: policyId })
      if (data && data[policyId]) {
        const p = data[policyId].policy
        policy.value = {
          id: policyId,
          name: p.name,
          schedule: p.schedule,
          repository: p.repository,
          indices: p.config?.indices?.join(',') || '*',
          ignoreUnavailable: p.config?.ignore_unavailable || false,
          includeGlobalState: p.config?.include_global_state || false,
          retentionExpireAfter: p.retention?.expire_after || '',
          retentionMaxCount: p.retention?.max_count || null,
          retentionMinCount: p.retention?.min_count || null
        }
      }
    } catch (error) {
      console.error('Failed to load policy:', error)
    }
  }

  const updatePolicy = async (policyName: string) => {
    if (!formValid.value) return

    const policyBody: SnapshotPolicyRequestBody = {
      name: policy.value.name,
      schedule: policy.value.schedule,
      repository: policy.value.repository,
      config: {
        indices: policy.value.indices.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0),
        ignore_unavailable: policy.value.ignoreUnavailable,
        include_global_state: policy.value.includeGlobalState
      }
    }

    if (policy.value.retentionExpireAfter || policy.value.retentionMaxCount || policy.value.retentionMinCount) {
      policyBody.retention = {}
      if (policy.value.retentionExpireAfter) {
        policyBody.retention.expire_after = policy.value.retentionExpireAfter
      }
      if (policy.value.retentionMaxCount) {
        policyBody.retention.max_count = policy.value.retentionMaxCount
      }
      if (policy.value.retentionMinCount) {
        policyBody.retention.min_count = policy.value.retentionMinCount
      }
    }

    const success = await run({
      params: {
        policy: policyName,
        body: policyBody
      },
      snackbarOptions: (body: ElasticsearchResponse) => {
        return {
          title: t('snapshot_policies.edit_policy.update_policy.growl', { name: policyName }),
          body: JSON.stringify(body)
        }
      }
    })

    if (success) closeDialog()
  }

  return {
    dialog,
    policy,
    formValid,
    loading,
    loadPolicy,
    updatePolicy,
    resetForm,
    closeDialog
  }
}
