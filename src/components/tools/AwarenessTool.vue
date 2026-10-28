<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <div v-if="!rows.length" class="text-muted">{{ t('tools.awareness.status_none') }}</div>
  <q-list v-else bordered separator class="rounded-borders">
    <q-item v-for="row in rows" :key="row.attribute">
      <q-item-section>
        <q-item-label>{{ row.attribute }}</q-item-label>
        <q-item-label caption>{{ t('tools.awareness.values', { values: row.values.join(', ') || '—' }) }}</q-item-label>
        <q-item-label caption>{{ t('tools.awareness.forced', { values: row.forced || '—' }) }}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
  <p class="font-13 text-muted q-mt-md">{{ t('tools.awareness.hint') }}</p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { effectiveSetting } from '../../helpers/clusterTools.ts'
import ToolError from './ToolError.vue'

const t = useTranslation()
const { requests, nodes, settings, awarenessAttributes } = useInjectedClusterTools()

const rows = computed(() =>
  awarenessAttributes.value.map((attribute) => ({
    attribute,
    values: [...new Set(nodes.value.map((node) => node.attributes[attribute]).filter(Boolean))].sort(),
    forced: String(
      effectiveSetting<string>(settings.value, `cluster.routing.allocation.awareness.force.${attribute}.values`, '')
        .effectiveValue || ''
    )
  }))
)
</script>
