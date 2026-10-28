<template>
  <p class="font-13 text-muted q-my-md">
    <template v-for="(setting, i) in settings" :key="setting">
      <code>{{ setting }}</code
      ><span v-if="i < settings.length - 1">, </span>
    </template>
    <template v-if="text">. {{ text }}</template>
  </p>
</template>

<script setup lang="ts">
defineProps<{ settings: string[]; text?: string }>()
</script>
