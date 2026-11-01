<template>
  <q-item clickable :disable="disabled || requestState.loading" @click="run">
    <q-item-section side>
      <q-spinner v-if="requestState.loading" />
      <q-icon v-else :name="icon" size="xs" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ text }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { ElasticsearchRequest } from '../../services/ElasticsearchAdapter.ts'
import { useRowMenuAction } from '../../composables/components/RowMenuAction.ts'

const props = defineProps<{
  request: ElasticsearchRequest
  icon: string
  text: string
  growl?: string
  confirm?: string
  disabled?: boolean
}>()
const emit = defineEmits(['done'])

const { run, requestState } = useRowMenuAction(props, emit)
</script>
