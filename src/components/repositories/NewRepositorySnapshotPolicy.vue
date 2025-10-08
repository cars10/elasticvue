<template>
  <q-btn color="primary-dark" :label="t('repositories.repository_policies.new_policy')" @click="dialog = true" />

  <q-dialog v-model="dialog" transition-duration="100" @hide="closeDialog">
    <q-card style="min-width: 600px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('repositories.repository_policies.new_policy') }}
        </h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-form @submit="createPolicy">
        <q-card-section>
          <custom-input
            v-model="policy.id"
            :label="t('snapshot_policies.new_policy.form.id.label')"
            class="q-mb-md"
            autocomplete="off"
            autofocus
            outlined
            required
            :rules="[required]"
          />

          <custom-input
            v-model="policy.name"
            :label="t('snapshot_policies.new_policy.form.name.label')"
            class="q-mb-md"
            autocomplete="off"
            autofocus
            outlined
            required
            :rules="[required]"
          />

          <custom-input
            v-model="policy.schedule"
            :label="t('snapshot_policies.new_policy.form.schedule.label')"
            :hint="t('snapshot_policies.new_policy.form.schedule.hint')"
            class="q-mb-md"
            outlined
            autocomplete="off"
            required
            :rules="[required]"
          />

          <custom-input
            v-model="policy.indices"
            :label="t('snapshot_policies.new_policy.form.indices.label')"
            :hint="t('snapshot_policies.new_policy.form.indices.hint')"
            class="q-mb-md"
            outlined
            placeholder="*"
          />

          <q-checkbox
            v-model="policy.ignoreUnavailable"
            :label="t('snapshot_policies.new_policy.form.ignore_unavailable.label')"
            class="q-mb-md"
          />

          <q-checkbox
            v-model="policy.includeGlobalState"
            :label="t('snapshot_policies.new_policy.form.include_global_state.label')"
            class="q-mb-md"
          />

          <q-separator class="q-my-lg" />

          <div class="text-subtitle2 q-mb-md">{{ t('snapshot_policies.new_policy.form.retention.heading') }}</div>

          <custom-input
            v-model="policy.retentionExpireAfter"
            :label="t('snapshot_policies.new_policy.form.retention.expire_after.label')"
            :hint="t('snapshot_policies.new_policy.form.retention.expire_after.hint')"
            class="q-mb-md"
            outlined
          />

          <custom-input
            v-model.number="policy.retentionMaxCount"
            :label="t('snapshot_policies.new_policy.form.retention.max_count.label')"
            :hint="t('snapshot_policies.new_policy.form.retention.max_count.hint')"
            class="q-mb-md"
            outlined
            type="number"
          />

          <custom-input
            v-model.number="policy.retentionMinCount"
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
            :label="t('defaults.create')"
            color="positive"
            type="submit"
            class="q-mr-md"
          />
          <q-btn v-close-popup flat :label="t('defaults.close')" />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n'
import { useNewRepositorySnapshotPolicy } from '../../composables/components/repositories/NewRepositorySnapshotPolicy'
import CustomInput from '../shared/CustomInput.vue'

const t = useTranslation()
const required = (val: string) => !!val || 'required'

const emit = defineEmits(['reload'])

const props = defineProps<{ repository: string }>()

const { dialog, policy, formValid, loading, createPolicy, closeDialog } = useNewRepositorySnapshotPolicy(emit, props.repository)
</script>
