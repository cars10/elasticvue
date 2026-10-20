<template>
  <div>
    <q-card>
      <q-item clickable @click="open" class="q-pa-md">
        <q-item-section>
          <q-item-label class="text-subtitle2 text-weight-medium">{{ title }}</q-item-label>
          <q-item-label caption class="text-muted">{{ description }}</q-item-label>
          <q-item-label class="q-mt-sm">
            <q-badge :color="attention ? 'warning' : 'positive'" :text-color="attention ? 'dark' : 'white'">
              {{ status }}
            </q-badge>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-card>

    <q-dialog :model-value="opened" position="right" @update:model-value="onDialogUpdate">
      <q-card
        class="tool-card__panel tool-card-panel column no-wrap full-height no-border-radius"
        style="width: 38rem; max-width: 100vw"
      >
        <q-card-section class="q-pa-lg">
          <div class="row items-start no-wrap">
            <div class="col">
              <div class="text-h6">{{ title }}</div>
              <div class="text-muted text-body2 q-mt-xs">{{ description }}</div>
            </div>
            <q-btn flat round dense icon="close" :aria-label="`Close ${title}`" @click="close" />
          </div>
        </q-card-section>
        <q-separator />

        <q-card-section class="col scroll q-pa-lg">
          <slot />

          <q-expansion-item v-if="endpoints.length" label="Elasticsearch APIs used" dense class="text-muted q-mt-xl">
            <div class="q-pt-sm">
              <div v-for="endpoint in endpoints" :key="endpoint" class="q-mb-xs word-break-all">
                <code>{{ endpoint }}</code>
              </div>
            </div>
          </q-expansion-item>
          <div v-else class="text-muted text-caption q-mt-xl">
            Read-only tool. No cluster-changing Elasticsearch endpoints are called.
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    toolId: string
    modelValue: string | null
    title: string
    description: string
    status: string
    endpoints: string[]
    attention?: boolean
  }>(),
  { attention: false }
)
const emit = defineEmits<{ open: []; 'update:modelValue': [value: string | null] }>()
const opened = computed(() => props.modelValue === props.toolId)

const open = () => {
  emit('update:modelValue', props.toolId)
  emit('open')
}
const close = () => emit('update:modelValue', null)
const onDialogUpdate = (value: boolean) => {
  if (!value) close()
}
</script>
