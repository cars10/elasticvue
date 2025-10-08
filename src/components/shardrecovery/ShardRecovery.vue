<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ t('shard_recovery.heading') }}
      </h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState">
      <shard-recovery-table :shard-recoveries="data || {}" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'
import { useElasticsearchRequest } from '../../composables/CallElasticsearch.ts'
import { onMounted } from 'vue'
import ReloadButton from '../shared/ReloadButton.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ShardRecoveryTable from './ShardRecoveryTable.vue'
import { IndexRecovery } from '../../composables/components/shardrecovery/ShardRecoveryTable.ts'

const t = useTranslation()

const { requestState, data, load } = useElasticsearchRequest<IndexRecovery>('recovery')
onMounted(() => load())
</script>
