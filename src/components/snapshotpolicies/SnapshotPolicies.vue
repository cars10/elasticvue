<template>
    <q-card>
        <q-card-section class="flex items-center">
            <h1 class="text-h5 q-my-none">{{ t('snapshot_policies.heading') }}</h1>
            <reload-button :action="load" />
        </q-card-section>

        <q-separator />

        <loader-status :request-state="requestState" hide-progress>
            <snapshot-policies-table :policies="data || {}" @reload="load" />
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
import type { EsSnapshotPolicy } from '../../composables/components/snapshotpolicies/SnapshotPoliciesTable'

const t = useTranslation()

const { load, requestState, data } = useElasticsearchRequest<Record<string, EsSnapshotPolicy>>('catSlmPolicies')

onMounted(load)
</script>
