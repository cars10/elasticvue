<template>
  <div>
    <div v-for="(value, key) in filtered" :key="key">{{ key }}: {{ value }}</div>
  </div>
</template>

<script setup lang="ts">
  import { NodeAttributesProps, useNodeAttributes } from '../../composables/components/nodes/NodeAttributes.ts'
  const props = defineProps<NodeAttributesProps>()

  const { filtered } = useNodeAttributes(props)
</script>