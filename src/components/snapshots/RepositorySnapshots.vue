<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">{{ t('snapshots.heading', { name: repository }) }}</h1>
      <reload-button :action="load" v-model="snapshotsStore.reloadInterval" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState" hide-progress>
      <snapshots-table :snapshots="data?.snapshots || []" :repository="repository" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'
import SnapshotsTable from './SnapshotsTable.vue'
import { useTranslation } from '../../composables/i18n'
import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
import { EsSnapshotList } from '../../composables/components/snapshots/SnapshotRow.ts'
import { useSnapshotsStore } from '../../store/snapshots.ts'
const t = useTranslation()
const snapshotsStore = useSnapshotsStore()
const route = useRoute()
const repository = route.params.repositoryName.toString()

const { load, requestState, data } = useElasticsearchRequest<EsSnapshotList>('catSnapshots', { repository })
onMounted(load)
</script>
