<template>
  <div class="flex justify-between items-center q-mb-md">
    <div>
      <h1 class="text-h4 q-my-none">{{ t('snapshots.heading', { name: repository }) }}</h1>
      <router-link :to="{ name: 'snapshot_repositories' }" class="font-13">
        {{ t('snapshots.repository') }}
      </router-link>
    </div>
    <reload-button :action="load" v-model="snapshotsStore.reloadInterval" />
  </div>

  <snapshots-pulse v-if="snapshots.length || running?.length" class="q-mb-lg" :summary="summary" :running="running" />

  <q-card>
    <loader-status :request-state="requestState" hide-progress>
      <snapshots-table :snapshots="snapshots" :repository="repository" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'
import SnapshotsTable from './SnapshotsTable.vue'
import SnapshotsPulse from './SnapshotsPulse.vue'
import { useTranslation } from '../../composables/i18n'
import { useRepositorySnapshots } from '../../composables/components/snapshots/RepositorySnapshots.ts'

const t = useTranslation()
const route = useRoute()
const repository = route.params.repositoryName.toString()

const { snapshotsStore, requestState, snapshots, running, summary, load } = useRepositorySnapshots(repository)
</script>
