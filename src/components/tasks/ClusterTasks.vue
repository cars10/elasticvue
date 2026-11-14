<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('tasks.heading') }}</h1>
    <reload-button :action="load" v-model="tasksStore.reloadInterval" />
  </div>

  <tasks-pulse class="q-mb-lg" :summary="summary" :hidden-count="hiddenCount" />

  <q-card>
    <loader-status :request-state="requestState">
      <tasks-table :tasks="tasks" :types="types" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import ReloadButton from '../shared/ReloadButton.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import TasksPulse from './TasksPulse.vue'
import TasksTable from './TasksTable.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useClusterTasks } from '../../composables/components/tasks/ClusterTasks.ts'

const t = useTranslation()
const { tasksStore, requestState, tasks, types, hiddenCount, summary, load } = useClusterTasks()
</script>
