<template>
  <q-dialog :model-value="true" position="right" @update:model-value="(open) => !open && emit('close')">
    <q-card class="tool-panel column no-wrap full-height no-border-radius" :data-testid="`tool-panel-${tool.id}`">
      <q-card-section class="q-pa-lg">
        <div class="row items-start no-wrap">
          <div class="col">
            <div class="text-h6">{{ tool.title }}</div>
            <div class="text-muted q-mt-xs">{{ tool.description }}</div>
          </div>
          <q-btn flat round dense icon="close" :aria-label="t('tools.close', { title: tool.title })" @click="emit('close')" />
        </div>
      </q-card-section>
      <q-separator />

      <q-card-section class="col scroll q-pa-lg">
        <component :is="tool.component" />

        <q-expansion-item v-if="tool.endpoints.length" :label="t('tools.apis_used')" dense class="text-muted q-mt-xl">
          <div class="q-pt-sm">
            <div v-for="endpoint in tool.endpoints" :key="endpoint" class="q-mb-xs word-break-all">
              <code>{{ endpoint }}</code>
            </div>
          </div>
        </q-expansion-item>
        <div v-else class="text-muted font-13 q-mt-xl">{{ t('tools.read_only_tool') }}</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'
import type { ToolDefinition } from './toolDefinitions.ts'

defineProps<{ tool: ToolDefinition }>()
const emit = defineEmits<{ close: [] }>()
const t = useTranslation()
</script>
