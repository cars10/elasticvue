<template>
  <q-card class="full-height" :data-testid="testId">
    <q-card-section>
      <div class="text-weight-bold q-mb-md flex items-center">
        <q-icon :name="icon" size="22px" class="q-mr-sm" color="primary" />
        {{ title }}
      </div>

      <div>
        <slot name="value" />
      </div>

      <slot />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  testId?: string
}>()
</script>
