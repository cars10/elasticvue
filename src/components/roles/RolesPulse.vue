<template>
  <div class="row q-col-gutter-lg" data-testid="roles-pulse">
    <div :class="colClass">
      <pulse-metric-card title="Roles" icon="key" :value="summary.total" test-id="roles-pulse-total">
        <div class="text-muted font-13 q-mt-xs">{{ summary.builtIn }} built-in · {{ summary.custom }} custom</div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        title="Cluster admin"
        icon="admin_panel_settings"
        :value="summary.clusterAdmin.length"
        test-id="roles-pulse-admin"
      >
        <div class="text-muted font-13 q-mt-xs">all, manage or manage_security</div>
        <div class="text-muted font-13 q-mt-xs">{{ namePreview(summary.clusterAdmin) }}</div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        title="All indices"
        icon="lock_open"
        :value="summary.allIndices.length"
        test-id="roles-pulse-all-indices"
      >
        <div class="text-muted font-13 q-mt-xs">all privileges on *</div>
        <div class="text-muted font-13 q-mt-xs">{{ namePreview(summary.allIndices) }}</div>
      </pulse-metric-card>
    </div>

    <div v-if="usageKnown" :class="colClass">
      <pulse-metric-card
        title="Unused"
        icon="block"
        :value="summary.unassigned.length"
        :value-class="summary.unassigned.length ? 'health--yellow' : undefined"
        test-id="roles-pulse-unused"
      >
        <div class="text-muted font-13 q-mt-xs">custom roles without users or role mappings</div>
        <div class="text-muted font-13 q-mt-xs">{{ namePreview(summary.unassigned) }}</div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { namePreview } from '../../helpers/security.ts'
import type { RolesSummary } from '../../types/security.ts'

const props = defineProps<{
  summary: RolesSummary
  usageKnown: boolean
}>()

const colClass = computed(() => (props.usageKnown ? 'col-12 col-sm-6 col-lg-3' : 'col-12 col-sm-4'))
</script>
