<template>
  <div class="row q-col-gutter-md" data-testid="roles-pulse">
    <div :class="colClass">
      <pulse-metric-card :title="t('cluster_roles.pulse.roles')" icon="key" :value="summary.total" test-id="roles-pulse-total">
        <div class="text-muted font-13 q-mt-xs">
          {{ t('cluster_users.pulse.split', { builtIn: summary.builtIn, custom: summary.custom }) }}
        </div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('cluster_roles.pulse.cluster_admin')"
        icon="admin_panel_settings"
        :value="summary.clusterAdmin.length"
        test-id="roles-pulse-admin"
      >
        <div class="text-muted font-13 q-mt-xs">{{ t('cluster_roles.pulse.cluster_admin_hint') }}</div>
      </pulse-metric-card>
    </div>

    <div :class="colClass">
      <pulse-metric-card
        :title="t('cluster_roles.pulse.all_indices')"
        icon="lock_open"
        :value="summary.allIndices.length"
        test-id="roles-pulse-all-indices"
      >
        <div class="text-muted font-13 q-mt-xs">{{ t('cluster_roles.pulse.all_indices_hint') }}</div>
      </pulse-metric-card>
    </div>

    <div v-if="usageKnown" :class="colClass">
      <pulse-metric-card
        :title="t('cluster_roles.pulse.unused')"
        icon="block"
        :value="summary.unassigned.length"
        :value-class="summary.unassigned.length ? 'health--yellow' : undefined"
        test-id="roles-pulse-unused"
      >
        <div class="text-muted font-13 q-mt-xs">{{ t('cluster_roles.pulse.unused_hint') }}</div>
      </pulse-metric-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { useTranslation } from '../../composables/i18n.ts'
import type { RolesSummary } from '../../types/security.ts'

const props = defineProps<{
  summary: RolesSummary
  usageKnown: boolean
}>()

const t = useTranslation()

const colClass = computed(() => (props.usageKnown ? 'col-12 col-sm-6 col-lg-3' : 'col-12 col-sm-4'))
</script>
