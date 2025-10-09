<template>
  <q-dialog v-model="dialog" transition-duration="100" @hide="closeDialog">
    <q-card style="min-width: 600px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('repositories.repository_policies.edit_policy') }}
        </h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <repository-snapshot-policy-form
        v-model="policy"
        :form-valid="formValid"
        :loading="loading"
        :is-edit="true"
        :submit-label="t('defaults.update')"
        @submit="updatePolicy"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n'
import { useEditRepositorySnapshotPolicy } from '../../composables/components/repositories/EditRepositorySnapshotPolicy'
import RepositorySnapshotPolicyForm from './RepositorySnapshotPolicyForm.vue'

const t = useTranslation()

const emit = defineEmits(['reload'])

const props = defineProps<{ repository: string; policyId: string }>()

const policyIdRef = ref(props.policyId)

watch(
  () => props.policyId,
  (newPolicyId) => {
    policyIdRef.value = newPolicyId
  }
)

const { dialog, policy, formValid, loading, updatePolicy, closeDialog, openDialog } = useEditRepositorySnapshotPolicy(
  emit,
  props.repository,
  policyIdRef
)

defineExpose({ openDialog })
</script>
