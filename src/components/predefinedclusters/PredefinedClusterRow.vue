<template>
  <tr class="clickable" @click="ownSelected = !ownSelected">
    <td>
      <q-checkbox v-model="ownSelected" color="primary" size="sm" />
    </td>
    <td>
      <predefined-cluster-status :cluster="cluster" />
    </td>
    <td>{{ ownCluster.name }}</td>
    <td>
      <a :href="ownCluster.uri" target="_blank">{{ ownCluster.uri }}</a>
    </td>
    <td>{{ ownCluster.username }}</td>
    <td>
      <span v-if="ownCluster.password?.length > 0">****</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
  import PredefinedClusterStatus from './PredefinedClusterStatus.vue'
  import { ref, watch } from 'vue'

  const props = defineProps<{ cluster: any, selected: boolean }>()
  const ownCluster = ref(props.cluster)
  const ownSelected = ref(props.selected)

  const emit = defineEmits(['update:cluster', 'update:selected'])
  watch(ownCluster, newValue => (emit('update:cluster', newValue)))
  watch(ownSelected, newValue => (emit('update:selected', newValue)))
  watch(() => props.cluster, newValue => (ownCluster.value = newValue))
</script>
