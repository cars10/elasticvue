<template>
  <div class="flex justify-between items-center q-mb-md">
    <h1 class="text-h4 q-my-none">{{ t('indices.heading') }}</h1>
    <reload-button :action="load" v-model="indicesStore.reloadInterval" />
  </div>

  <indices-pulse v-if="summary.total" class="q-mb-lg" :summary="summary" />

  <q-card>
    <loader-status :request-state="requestState">
      <indices-table :indices="indices" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import IndicesTable from './IndicesTable.vue'
import IndicesPulse from './IndicesPulse.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useClusterIndices } from '../../composables/components/indices/ClusterIndices.ts'

const t = useTranslation()
const { indicesStore, requestState, indices, summary, load } = useClusterIndices()
</script>
