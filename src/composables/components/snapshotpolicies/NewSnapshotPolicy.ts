import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { defineElasticsearchRequest } from '../../CallElasticsearch'
import type { SnapshotPolicyForm, SnapshotPolicyRequestBody, EmitFunction, ElasticsearchResponse } from '../../../types/snapshotPolicies'

export const useNewSnapshotPolicy = (emit: EmitFunction) => {
  const t = useTranslation()

  const dialog = ref(false)
  const policy = ref<SnapshotPolicyForm>({
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
    policy.value.name.length > 0 && 
    policy.value.schedule.length > 0 && 
    policy.value.repository.length > 0
  ))

  const resetForm = () => {
    policy.value = {
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
  
  const createPolicy = async () => {
    if (!formValid.value) return

    const policyBody: SnapshotPolicyRequestBody = {
      schedule: policy.value.schedule,
      repository: policy.value.repository,
      config: {
        indices: policy.value.indices.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0),
        ignore_unavailable: policy.value.ignoreUnavailable,
        include_global_state: policy.value.includeGlobalState
      }
    }

    // Add retention if specified
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
        policy: policy.value.name,
        body: policyBody
      },
      snackbarOptions: (body: ElasticsearchResponse) => {
        return {
          title: t('snapshot_policies.new_policy.create_policy.growl', { name: policy.value.name }),
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
    createPolicy,
    resetForm,
    closeDialog
  }
}
