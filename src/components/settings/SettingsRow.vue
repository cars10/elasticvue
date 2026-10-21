<template>
  <q-card-section>
    <div class="row items-center q-col-gutter-md">
      <div class="col-12 col-sm-6">
        <div>{{ label }}</div>
        <div v-if="description" class="text-muted font-13">{{ description }}</div>
      </div>
      <div class="col-12 col-sm-6 row justify-end">
        <slot />
      </div>
    </div>
  </q-card-section>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  description?: string
}>()
</script>
