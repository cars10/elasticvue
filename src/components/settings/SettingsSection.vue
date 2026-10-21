<template>
  <q-card class="q-mb-lg">
    <q-card-section class="row no-wrap items-start">
      <q-icon :name="icon" size="22px" :color="iconColor || 'primary'" class="q-mt-xs q-mr-md" />
      <div>
        <h2 class="text-h6 q-my-none">{{ title }}</h2>
        <div v-if="description" class="text-muted font-13">{{ description }}</div>
      </div>
    </q-card-section>

    <q-separator />

    <slot />
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description?: string
  iconColor?: string
}>()
</script>
