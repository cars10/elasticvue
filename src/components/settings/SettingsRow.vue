<template>
  <q-item class="q-py-md">
    <q-item-section>
      <q-item-label>{{ label }}</q-item-label>
      <q-item-label v-if="description || $slots.description" caption class="text-muted">
        <slot name="description">{{ description }}</slot>
      </q-item-label>
    </q-item-section>
    <q-item-section side class="col-5 items-end">
      <slot />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  description?: string
}>()
</script>
