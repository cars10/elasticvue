<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">{{ t('snapshots.heading', { name: repository }) }}</h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState" hide-progress>
      <snapshots-table :snapshots="data || []" :repository="repository" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import ReloadButton from '../shared/ReloadButton.vue'
  import SnapshotsTable from './SnapshotsTable.vue'
  import { useTranslation } from '../../composables/i18n'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'

  const t = useTranslation()

  const route = useRoute()
  const repository = route.params.repositoryName.toString()

  const { load, requestState, data } = useElasticsearchRequest<object[]>('catSnapshots', { repository })
  onMounted(load)
</script>