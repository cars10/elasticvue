<template>
  <q-form @submit="submit">
    <q-card-section>
      <custom-input
        v-model="localPolicy.id"
        :label="t('snapshot_policies.new_policy.form.id.label')"
        class="q-mb-md"
        autocomplete="off"
        :autofocus="!isEdit"
        outlined
        required
        :rules="[required]"
        :readonly="isEdit"
      />

      <custom-input
        v-model="localPolicy.name"
        :label="t('snapshot_policies.new_policy.form.name.label')"
        class="q-mb-md"
        autocomplete="off"
        :autofocus="isEdit"
        outlined
        required
        :rules="[required]"
      />

      <custom-input
        v-model="localPolicy.schedule"
        :label="t('snapshot_policies.new_policy.form.schedule.label')"
        :hint="t('snapshot_policies.new_policy.form.schedule.hint')"
        class="q-mb-md"
        outlined
        autocomplete="off"
        required
        :rules="[required]"
      />

      <custom-input
        v-model="localPolicy.indices"
        :label="t('snapshot_policies.new_policy.form.indices.label')"
        :hint="t('snapshot_policies.new_policy.form.indices.hint')"
        class="q-mb-md"
        outlined
        placeholder="*"
      />

      <q-checkbox
        v-model="localPolicy.ignoreUnavailable"
        :label="t('snapshot_policies.new_policy.form.ignore_unavailable.label')"
        class="q-mb-md"
      />

      <q-checkbox
        v-model="localPolicy.includeGlobalState"
        :label="t('snapshot_policies.new_policy.form.include_global_state.label')"
        class="q-mb-md"
      />

      <q-separator class="q-my-lg" />

      <div class="text-subtitle2 q-mb-md">{{ t('snapshot_policies.new_policy.form.retention.heading') }}</div>

      <custom-input
        v-model="localPolicy.retentionExpireAfter"
        :label="t('snapshot_policies.new_policy.form.retention.expire_after.label')"
        :hint="t('snapshot_policies.new_policy.form.retention.expire_after.hint')"
        class="q-mb-md"
        outlined
      />

      <custom-input
        v-model.number="localPolicy.retentionMaxCount"
        :label="t('snapshot_policies.new_policy.form.retention.max_count.label')"
        :hint="t('snapshot_policies.new_policy.form.retention.max_count.hint')"
        class="q-mb-md"
        outlined
        type="number"
      />

      <custom-input
        v-model.number="localPolicy.retentionMinCount"
        :label="t('snapshot_policies.new_policy.form.retention.min_count.label')"
        :hint="t('snapshot_policies.new_policy.form.retention.min_count.hint')"
        outlined
        type="number"
      />
    </q-card-section>

    <q-card-section>
      <q-btn
        :disable="loading || !formValid"
        :loading="loading"
        :label="submitLabel"
        color="positive"
        type="submit"
        class="q-mr-md"
      />
      <q-btn v-close-popup flat :label="t('defaults.close')" />
    </q-card-section>
  </q-form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/i18n'
import CustomInput from '../shared/CustomInput.vue'
import type { SnapshotPolicyForm } from '../../types/snapshotPolicies'

const t = useTranslation()
const required = (val: string) => !!val || 'required'

interface Props {
  modelValue: SnapshotPolicyForm
  formValid: boolean
  loading: boolean
  isEdit?: boolean
  submitLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  submitLabel: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: SnapshotPolicyForm]
  submit: []
}>()

const localPolicy = computed({
  get: () => props.modelValue,
  set: (value: SnapshotPolicyForm) => emit('update:modelValue', value)
})

const submit = () => {
  emit('submit')
}
</script>
