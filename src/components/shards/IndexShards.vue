<template>
  <div class="flex justify-between items-center q-mb-md">
    <h1 class="text-h4 q-my-none">{{ t('shards.heading') }}</h1>
    <reload-button :action="load" v-model="shardsStore.reloadInterval" />
  </div>

  <shards-pulse v-if="summary.total" class="q-mb-lg" :summary="summary" />

  <problem-shards v-if="problems.length" class="q-mb-lg" :shards="problems" />

  <q-card>
    <loader-status :request-state="requestState">
      <shards-table :shards="shards" @reload="load">
        <q-select
          v-model="shardsStore.health"
          :options="['green', 'yellow', 'red']"
          :label="t('shards.health')"
          clearable
          dense
          outlined
          class="q-mr-md"
          style="min-width: 140px"
        />
      </shards-table>
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import ReloadButton from '../shared/ReloadButton.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ProblemShards from './ProblemShards.vue'
import ShardsPulse from './ShardsPulse.vue'
import ShardsTable from './ShardsTable.vue'
import { useTranslation } from '../../composables/i18n'
import { useShardsStore } from '../../store/shards.ts'
import { useIndexShards } from '../../composables/components/shards/IndexShards.ts'

const t = useTranslation()
const shardsStore = useShardsStore()
const { requestState, shards, summary, problems, load } = useIndexShards()
</script>
