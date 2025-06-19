<template>
  <cluster-status-indicator :status="health" />
</template>

<script setup lang="ts">
  import ClusterStatusIndicator from '../clusterselection/ClusterStatusIndicator.vue'
  import { checkClusterHealth } from '../../composables/components/home/ClusterHealth.ts'
  import { ref } from 'vue'
  import { ElasticsearchCluster } from '../../store/connection.ts'
  import { buildAuth } from '../../composables/components/predefinedclusters/PredefinedClusters.ts'

  const props = defineProps<{ cluster: ElasticsearchCluster }>()
  const health = ref('unknown')

  const load = async () => {
    const auth = buildAuth(props.cluster)
    const cluster = {
      uri: props.cluster.uri,
      name: props.cluster.name,
      auth
    }
    health.value = await checkClusterHealth(cluster)
  }
  load()
</script>
