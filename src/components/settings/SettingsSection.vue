<template>
  <section class="q-mb-lg">
    <h2 class="section-title">{{ title }}</h2>
    <div v-if="description || $slots.description" class="text-muted font-13 q-mb-sm">
      <slot name="description">{{ description }}</slot>
    </div>
    <q-card>
      <q-list separator>
        <slot />
      </q-list>
    </q-card>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
