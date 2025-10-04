<template>
    <q-card>
        <q-card-section class="flex items-center">
            <h1 class="text-h5 q-my-none">{{ t('snapshot_policies.heading') }}</h1>
            <reload-button :action="load" />
        </q-card-section>

        <q-separator />

        <loader-status :request-state="requestState" hide-progress>
            <div v-if="!isSlmSupported" class="q-pa-md">
                <q-banner class="bg-warning text-white">
                    <template #avatar>
                        <q-icon name="warning" />
                    </template>
                    {{ t('snapshot_policies.unsupported_version') }}
                </q-banner>
            </div>
            <snapshot-policies-table v-else :policies="data || {}" @reload="load" />
        </loader-status>
    </q-card>
</template>

<script setup lang="ts">
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import { onMounted } from 'vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import SnapshotPoliciesTable from './SnapshotPoliciesTable.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { useSlmSupport } from '../../helpers/slmSupport'
  import type { EsSnapshotPolicy } from '../../composables/components/snapshotpolicies/SnapshotPoliciesTable'

  const t = useTranslation()
  const { isSlmSupported } = useSlmSupport()

  const { load, requestState, data } = useElasticsearchRequest<Record<string, EsSnapshotPolicy>>('slmGetPolicies')

  onMounted(() => {
    if (isSlmSupported.value) {
      load()
    }
  })
</script>
