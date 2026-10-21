<template>
  <div class="flex justify-between items-center q-mb-md">
    <h1 class="text-h4 q-my-none">{{ t('repositories.heading') }}</h1>
    <reload-button :action="load" v-model="snapshotRepositoriesStore.reloadInterval" />
  </div>

  <repositories-pulse
    v-if="repositories.length"
    class="q-mb-lg"
    :summary="summary"
    :running="running"
    :slm="policies !== null"
    :slm-hint="slm ? 'Could not load snapshot policies' : 'Requires Elasticsearch 7.4+'"
  />

  <q-card>
    <loader-status :request-state="requestState" hide-progress>
      <snapshot-repositories-table :repositories="repositories" :slm="slm" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import ReloadButton from '../shared/ReloadButton.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import SnapshotRepositoriesTable from './SnapshotRepositoriesTable.vue'
import RepositoriesPulse from './RepositoriesPulse.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useSnapshotRepositories } from '../../composables/components/repositories/SnapshotRepositories.ts'

const t = useTranslation()
const { snapshotRepositoriesStore, requestState, repositories, policies, running, summary, slm, load } = useSnapshotRepositories()
</script>
