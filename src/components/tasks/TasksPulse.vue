<template>
  <div class="row q-col-gutter-md" data-testid="tasks-pulse">
    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        :title="t('tasks.pulse.running')"
        icon="pending_actions"
        :value="summary.running"
        :unit="t('tasks.pulse.tasks', summary.running)"
        test-id="tasks-pulse-running"
      >
        <div v-if="summary.running" class="text-muted font-13 q-mt-xs">{{ categoryBreakdown }}</div>
        <div v-else class="text-muted font-13 q-mt-xs">{{ t('tasks.pulse.none_running') }}</div>
        <div v-if="summary.subtasks" class="text-muted font-13 q-mt-xs">
          {{ t('tasks.task.subtasks', summary.subtasks) }}
        </div>
        <div v-if="hiddenCount" class="text-muted font-13 q-mt-xs" data-testid="tasks-hidden">
          {{ t('tasks.pulse.hidden_by_filters', hiddenCount) }}
        </div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        :title="t('tasks.pulse.longest')"
        icon="timer"
        :value="summary.longest?.runningMs == null ? null : formatTime(summary.longest.runningMs)"
        :value-class="summary.longRunning ? 'health--yellow' : undefined"
        test-id="tasks-pulse-longest"
      >
        <div v-if="summary.longest" class="font-mono font-13 text-muted q-mt-xs ellipsis">{{ summary.longest.action }}</div>
        <div v-if="summary.longRunning" class="font-13 health--yellow q-mt-xs">
          {{ t('tasks.pulse.long_running', summary.longRunning) }}
        </div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        :title="t('tasks.pulse.background')"
        icon="sync"
        :value="summary.background"
        :unit="t('tasks.pulse.jobs', summary.background)"
        test-id="tasks-pulse-background"
      >
        <metric-bar
          v-if="summary.backgroundPercent != null"
          class="q-mt-sm"
          :value="summary.backgroundPercent"
          :detail="`${formatCount(summary.backgroundDone)} / ${formatCount(summary.backgroundTotal)}`"
        />
        <div v-else class="text-muted font-13 q-mt-xs">{{ t('tasks.pulse.background_hint') }}</div>
      </pulse-metric-card>
    </div>

    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        :title="t('tasks.pulse.searches')"
        icon="search"
        :value="summary.searches"
        :unit="t('tasks.pulse.running_unit')"
        test-id="tasks-pulse-searches"
      >
        <div v-if="summary.slowestSearch?.runningMs != null" class="text-muted font-13 q-mt-xs">
          {{ t('tasks.pulse.slowest', { time: formatTime(summary.slowestSearch.runningMs) }) }}
        </div>
        <div v-else class="text-muted font-13 q-mt-xs">{{ t('tasks.pulse.no_searches') }}</div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import MetricBar from '../shared/MetricBar.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useTaskCategories } from '../../composables/components/tasks/TaskCategories.ts'
import { formatCount } from '../../helpers/nodes.ts'
import { formatTime } from '../../helpers/time.ts'
import type { TasksSummary } from '../../types/tasks.ts'

const props = defineProps<{ summary: TasksSummary; hiddenCount: number }>()

const t = useTranslation()
const { categoryLabel } = useTaskCategories()

const categoryBreakdown = computed(() =>
  props.summary.categories.map(({ category, count }) => `${count} ${categoryLabel(category)}`).join(', ')
)
</script>
