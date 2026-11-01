<template>
  <router-view :key="String(route.params.clusterId)" />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
