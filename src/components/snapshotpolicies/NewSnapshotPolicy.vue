<template>
    <q-btn color="primary-dark" :label="t('snapshot_policies.new_policy.heading')" @click="dialog = true" />

    <q-dialog v-model="dialog" transition-duration="100" @hide="closeDialog">
        <q-card style="min-width: 600px">
            <q-card-section class="flex justify-between">
                <h2 class="text-h6 q-my-none">
                    {{ t('snapshot_policies.new_policy.heading') }}
                </h2>
                <q-btn v-close-popup icon="close" flat round dense />
            </q-card-section>

            <q-separator />

            <q-form @submit="createPolicy">
                <q-card-section>
                    <custom-input v-model="policy.name" :label="t('snapshot_policies.new_policy.form.name.label')"
                        class="q-mb-md" lazy-rules autocomplete="off" autofocus outlined required />
                    <div v-if="!policy.name" class="text-negative text-caption q-mt-xs">
                        {{ t('snapshot_policies.new_policy.form.name.required') }}
                    </div>

                    <custom-input v-model="policy.schedule"
                        :label="t('snapshot_policies.new_policy.form.schedule.label')"
                        :hint="t('snapshot_policies.new_policy.form.schedule.hint')" class="q-mb-md" lazy-rules outlined
                        autocomplete="off" required />
                    <div v-if="!policy.schedule" class="text-negative text-caption q-mt-xs">
                        {{ t('snapshot_policies.new_policy.form.schedule.required') }}
                    </div>

                    <q-select v-model="policy.repository"
                        :label="t('snapshot_policies.new_policy.form.repository.label')" :options="repositoryOptions"
                        class="q-mb-md" outlined required />
                    <div v-if="!policy.repository" class="text-negative text-caption q-mt-xs">
                        {{ t('snapshot_policies.new_policy.form.repository.required') }}
                    </div>

                    <custom-input v-model="policy.indices" :label="t('snapshot_policies.new_policy.form.indices.label')"
                        :hint="t('snapshot_policies.new_policy.form.indices.hint')" class="q-mb-md" outlined
                        placeholder="*" />

                    <q-checkbox v-model="policy.ignoreUnavailable"
                        :label="t('snapshot_policies.new_policy.form.ignore_unavailable.label')" class="q-mb-md" />

                    <q-checkbox v-model="policy.includeGlobalState"
                        :label="t('snapshot_policies.new_policy.form.include_global_state.label')" class="q-mb-md" />

                    <q-separator class="q-my-lg" />

                    <div class="text-subtitle2 q-mb-md">{{ t('snapshot_policies.new_policy.form.retention.heading') }}
                    </div>

                    <custom-input v-model="policy.retentionExpireAfter"
                        :label="t('snapshot_policies.new_policy.form.retention.expire_after.label')"
                        :hint="t('snapshot_policies.new_policy.form.retention.expire_after.hint')" class="q-mb-md"
                        outlined />

                    <custom-input v-model.number="policy.retentionMaxCount"
                        :label="t('snapshot_policies.new_policy.form.retention.max_count.label')"
                        :hint="t('snapshot_policies.new_policy.form.retention.max_count.hint')" class="q-mb-md" outlined
                        type="number" />

                    <custom-input v-model.number="policy.retentionMinCount"
                        :label="t('snapshot_policies.new_policy.form.retention.min_count.label')"
                        :hint="t('snapshot_policies.new_policy.form.retention.min_count.hint')" outlined
                        type="number" />
                </q-card-section>

                <q-card-section>
                    <q-btn :disable="loading || !formValid" :loading="loading" :label="t('defaults.create')"
                        color="positive" type="submit" class="q-mr-md" />
                    <q-btn v-close-popup flat :label="t('defaults.close')" />
                </q-card-section>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTranslation } from '../../composables/i18n'
import { useNewSnapshotPolicy } from '../../composables/components/snapshotpolicies/NewSnapshotPolicy'
import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
import CustomInput from '../shared/CustomInput.vue'
import type { SnapshotRepository } from '../../types/snapshotPolicies'

const t = useTranslation()
const emit = defineEmits(['reload'])

const {
    dialog,
    policy,
    formValid,
    loading,
    createPolicy,
    closeDialog
} = useNewSnapshotPolicy(emit)

// Load repositories for the dropdown
const { data: repositoriesData, load } = useElasticsearchRequest<Record<string, SnapshotRepository>>('catRepositories')
onMounted(() => {
    load()
})
const repositoryOptions = computed(() => {
    if (!repositoriesData.value) return []
    return Object.keys(repositoriesData.value).map(name => ({ label: name, value: name }))
})
</script>
