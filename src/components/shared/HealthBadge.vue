<template>
  <div class="cluster-status" :class="`cluster-status--${status || 'unknown'}`">
    <span class="cluster-status__dot" />
    <span>{{ healthLabel(status) }}</span>
  </div>
</template>

<script setup lang="ts">
import { useHealthLabel } from '../../composables/HealthLabel.ts'

defineProps<{ status?: string | null }>()

const healthLabel = useHealthLabel()
</script>

<style scoped>
.cluster-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 600;
  /* Pull text towards the theme's text color so yellow stays readable on light backgrounds */
  color: color-mix(in srgb, var(--status-color) 70%, var(--theme-color));
  background: color-mix(in srgb, var(--status-color) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--status-color) 35%, transparent);
}

.cluster-status__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--status-color);
}

.cluster-status--green {
  --status-color: var(--theme-positive);
}

.cluster-status--yellow {
  --status-color: var(--theme-warning);
}

.cluster-status--red {
  --status-color: var(--theme-negative);
}

.cluster-status--unknown {
  --status-color: var(--theme-muted-color);
}
</style>
