<template>
  <tr :class="{ clickable: hasChildren }" data-testid="task-row" @click="expand = hasChildren && !expand">
    <td>
      <q-icon v-if="hasChildren" :name="expand ? 'expand_less' : 'expand_more'" />
    </td>
    <td>
      <div class="row items-center no-wrap q-gutter-x-sm">
        <q-badge :outline="!background" color="primary" :label="categoryLabel(task.category)" />
        <q-badge v-if="task.cancelled" color="warning" text-color="dark" :label="t('tasks.task.cancelled')" />
      </div>
      <div class="font-mono font-13 q-mt-xs">{{ task.action }}</div>
      <div v-if="hasChildren" class="text-muted font-13">
        {{ t('tasks.task.subtasks', task.children.length) }}
      </div>
    </td>
    <td class="description-cell">
      <div v-if="task.description" class="ellipsis-2-lines font-13" :title="task.description">{{ task.description }}</div>
      <span v-else class="text-muted">-</span>
    </td>
    <td>
      <div>{{ task.node }}</div>
      <div class="text-muted font-13 font-mono">{{ task.id }}</div>
    </td>
    <td class="progress-cell">
      <metric-bar v-if="task.progress != null" :value="task.progress" :detail="progressDetail" />
      <span v-else class="text-muted">-</span>
    </td>
    <td class="text-right" :class="{ 'health--yellow': longRunning }">
      {{ task.runningMs == null ? '-' : formatTime(task.runningMs) }}
    </td>
    <td>
      <template v-if="task.startTime">
        <div>{{ new Date(task.startTime).toLocaleDateString() }}</div>
        <div class="text-muted font-13">{{ new Date(task.startTime).toLocaleTimeString() }}</div>
      </template>
      <span v-else class="text-muted">-</span>
    </td>
    <td class="text-right" @click.stop>
      <q-btn
        v-if="task.cancellable"
        flat
        round
        dense
        icon="cancel"
        data-testid="cancel-task"
        :title="t('tasks.task.cancel.label')"
        :disable="task.cancelled"
        :loading="cancelling"
        @click="cancelTask"
      />
    </td>
  </tr>

  <tr v-if="expand && hasChildren">
    <td colspan="100%">
      <q-list dense bordered separator class="rounded-borders q-ma-md">
        <q-item v-for="child in task.children" :key="child.id">
          <q-item-section>
            <q-item-label class="font-mono font-13">{{ child.action }}</q-item-label>
            <q-item-label caption>{{ child.node }}, {{ child.id }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            {{ child.runningMs == null ? '-' : formatTime(child.runningMs) }}
          </q-item-section>
        </q-item>
      </q-list>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import MetricBar from '../shared/MetricBar.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useTaskRow } from '../../composables/components/tasks/TaskRow.ts'
import { useTaskCategories } from '../../composables/components/tasks/TaskCategories.ts'
import { BACKGROUND_CATEGORIES, LONG_RUNNING_MS } from '../../helpers/tasks.ts'
import { formatCount } from '../../helpers/nodes.ts'
import { formatTime } from '../../helpers/time.ts'
import type { ClusterTask } from '../../types/tasks.ts'

const props = defineProps<{ task: ClusterTask }>()
const emit = defineEmits<{ reload: [] }>()

const t = useTranslation()
const { categoryLabel } = useTaskCategories()
const { cancelTask, cancelling } = useTaskRow(props, emit)
const expand = ref(false)

const hasChildren = computed(() => props.task.children.length > 0)
const background = computed(() => BACKGROUND_CATEGORIES.includes(props.task.category))
const longRunning = computed(() => (props.task.runningMs || 0) >= LONG_RUNNING_MS)
const progressDetail = computed(() => {
  const { progressDone, progressTotal } = props.task
  if (progressDone == null || progressTotal == null) return null
  return `${formatCount(progressDone)} / ${formatCount(progressTotal)}`
})
</script>

<style scoped>
.progress-cell {
  min-width: 160px;
}

.description-cell {
  max-width: 360px;
  white-space: normal;
}
</style>
