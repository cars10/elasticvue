import { useTranslation } from '../../i18n'
import { computed, ref, watch, type Ref } from 'vue'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import type { SnapshotPolicyForm, SnapshotPolicyRequestBody, ElasticsearchResponse } from '../../../types/snapshotPolicies'

export const useEditRepositorySnapshotPolicy = (emit: any, repository: string, policyId: Ref<string>) => {
  const t = useTranslation()
  const { callElasticsearch } = useElasticsearchAdapter()

  const dialog = ref(false)
  const policy = ref<SnapshotPolicyForm>({
    id: '',
    name: '',
    schedule: '',
    repository: repository,
    indices: '*',
    ignoreUnavailable: false,
    includeGlobalState: true,
    retentionExpireAfter: '',
    retentionMaxCount: null,
    retentionMinCount: null
  })

  const formValid = computed(() => policy.value.name.length > 0 && policy.value.schedule.length > 0)

  watch(policyId, async (newPolicyId) => {
    if (newPolicyId && dialog.value) {
      await loadPolicy()
    }
  })

  const loadPolicy = async () => {
    try {
      const response = await callElasticsearch('slmGetPolicy', { policy: policyId.value })

      let policyData = null

      if (response[policyId.value]?.policy) {
        // Structure: { policyId: { policy: {...} } }
        policyData = response[policyId.value].policy
      } else if (response.policy) {
        // Structure: { policy: {...} }
        policyData = response.policy
      } else if (response[policyId.value]) {
        // Structure: { policyId: {...} }
        policyData = response[policyId.value]
      }

      if (policyData) {
        policy.value = {
          id: policyId.value,
          name: policyData.name || '',
          schedule: policyData.schedule || '',
          repository: policyData.repository || repository,
          indices: policyData.config?.indices?.join(', ') || '*',
          ignoreUnavailable: policyData.config?.ignore_unavailable || false,
          includeGlobalState: policyData.config?.include_global_state ?? true,
          retentionExpireAfter: policyData.retention?.expire_after || '',
          retentionMaxCount: policyData.retention?.max_count || null,
          retentionMinCount: policyData.retention?.min_count || null
        }
      }
    } catch (error) {
      console.error('Failed to load policy:', error)
    }
  }

  const resetForm = () => {
    policy.value = {
      id: '',
      name: '',
      schedule: '',
      repository: repository,
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

  const openDialog = async () => {
    dialog.value = true
    await loadPolicy()
  }

  const { run, loading } = defineElasticsearchRequest({
    emit: (event: string) => emit(event as 'reload'),
    method: 'slmPutPolicy'
  })

  const updatePolicy = async () => {
    if (!formValid.value) return

    const policyBody: SnapshotPolicyRequestBody = {
      name: policy.value.name,
      schedule: policy.value.schedule,
      repository: policy.value.repository,
      config: {
        indices: policy.value.indices
          .split(',')
          .map((i: string) => i.trim())
          .filter((i: string) => i.length > 0),
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
        policy: policy.value.id,
        body: policyBody
      },
      snackbarOptions: (body: ElasticsearchResponse) => {
        return {
          title: t('snapshot_policies.edit_policy.update_policy.growl', { name: policy.value.name }),
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
    updatePolicy,
    resetForm,
    closeDialog,
    openDialog
  }
}
