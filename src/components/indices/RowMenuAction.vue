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
import { ElasticsearchMethod } from '../../services/ElasticsearchAdapter'
import { useRowMenuAction } from '../../composables/components/RowMenuAction.ts'

const props = defineProps<{
  method: ElasticsearchMethod
  methodParams: unknown
  icon: string
  text: string
  growl?: string
  confirm?: string
  disabled?: boolean
}>()
const emit = defineEmits(['done'])

const { run, requestState } = useRowMenuAction({
  method: props.method,
  methodParams: props.methodParams,
  growl: props.growl,
  confirm: props.confirm,
  emit
})
</script>
