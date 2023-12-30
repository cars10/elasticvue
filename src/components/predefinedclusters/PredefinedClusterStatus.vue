<template>
  <cluster-status-indicator :status="health" />
</template>

<script setup lang="ts">
  import ClusterStatusIndicator from '../clusterselection/ClusterStatusIndicator.vue'
  import { checkClusterHealth } from '../../composables/components/home/ClusterHealth.ts'
  import { ref } from 'vue'
  import { ElasticsearchClusterCredentials } from '../../store/connection.ts'

  const props = defineProps<{ cluster: ElasticsearchClusterCredentials }>()
  const health = ref('unknown')

  const load = async () => {
    health.value = await checkClusterHealth(props.cluster)
  }
  load()
</script>
