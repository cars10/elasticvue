<template>
  <div class="flex justify-between items-center q-mb-md">
    <h1 class="text-h4 q-my-none">{{ t('shard_recovery.heading') }}</h1>
    <reload-button :action="load" v-model="shardRecoveryStore.reloadInterval" />
  </div>

  <recovery-pulse class="q-mb-lg" :summary="summary" :completed-loaded="!shardRecoveryStore.activeOnly" />

  <q-card>
    <loader-status :request-state="requestState">
      <shard-recovery-table :recoveries="recoveries" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useElasticsearchAdapter } from '../../composables/CallElasticsearch.ts'
import ReloadButton from '../shared/ReloadButton.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import RecoveryPulse from './RecoveryPulse.vue'
import ShardRecoveryTable from './ShardRecoveryTable.vue'
import { parseRecoveries, RECOVERY_FILTER_PATH, summarizeRecoveries } from '../../helpers/shardRecovery.ts'
import { useShardRecoveryStore } from '../../store/shardRecovery.ts'
import type { IndexRecovery } from '../../types/shardRecovery.ts'

const t = useTranslation()
const shardRecoveryStore = useShardRecoveryStore()
const { requestState, callElasticsearch } = useElasticsearchAdapter()

const data = shallowRef<IndexRecovery | null>(null)
const recoveries = computed(() => parseRecoveries(data.value))
const summary = computed(() => summarizeRecoveries(recoveries.value))

const load = async () => {
  try {
    data.value = await callElasticsearch('recovery', {
      filter_path: RECOVERY_FILTER_PATH,
      ...(shardRecoveryStore.activeOnly && { active_only: true })
    })
  } catch {
    data.value = null
  }
}

watch(() => shardRecoveryStore.activeOnly, load)
onMounted(load)
</script>
