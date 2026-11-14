<template>
  <router-view :key="session.connectionId" />
</template>

<script setup lang="ts">
import { useClusterSession } from '../../store/clusterSession.ts'

const session = useClusterSession()
</script>
