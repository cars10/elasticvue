<template>
  <div class="row q-col-gutter-md" data-testid="index-templates-pulse">
    <div class="col-12 col-sm-6 col-lg-3">
      <pulse-metric-card
        :title="t('index_templates.pulse.templates')"
        icon="description"
        :value="summary.composable + summary.legacy"
        test-id="index-templates-pulse-total"
      >
        <div class="text-muted font-13 q-mt-xs">
          {{ t('index_templates.pulse.split', { composable: summary.composable, legacy: summary.legacy }) }}
        </div>
      </pulse-metric-card>
    </div>

    <template v-if="composableSupported">
      <div class="col-12 col-sm-6 col-lg-3">
        <pulse-metric-card
          :title="t('index_templates.pulse.components')"
          icon="extension"
          :value="summary.component"
          test-id="index-templates-pulse-components"
        >
          <div class="text-muted font-13 q-mt-xs">
            {{ t('index_templates.pulse.unused_components', { count: summary.unusedComponents }, summary.unusedComponents) }}
          </div>
        </pulse-metric-card>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <pulse-metric-card
          :title="t('index_templates.pulse.data_streams')"
          icon="stream"
          :value="summary.dataStreams"
          test-id="index-templates-pulse-data-streams"
        >
          <div class="text-muted font-13 q-mt-xs">{{ t('index_templates.pulse.data_streams_hint') }}</div>
        </pulse-metric-card>
      </div>

      <div class="col-12 col-sm-6 col-lg-3">
        <pulse-metric-card
          :title="t('index_templates.pulse.legacy')"
          icon="history"
          :value="summary.legacy"
          :value-class="summary.legacy ? 'health--yellow' : undefined"
          test-id="index-templates-pulse-legacy"
        >
          <div class="text-muted font-13 q-mt-xs">
            {{ summary.legacy ? t('index_templates.pulse.legacy_hint') : t('index_templates.pulse.no_legacy') }}
          </div>
        </pulse-metric-card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import PulseMetricCard from '../shared/PulseMetricCard.vue'
import { useTranslation } from '../../composables/i18n.ts'
import type { IndexTemplatesSummary } from '../../types/indexTemplates.ts'

defineProps<{
  summary: IndexTemplatesSummary
  composableSupported: boolean
}>()

const t = useTranslation()
</script>
