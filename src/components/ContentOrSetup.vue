<template>
  <div v-if="isConnected || wasConnected">
    <slot></slot>
  </div>
  <setup v-else></setup>
</template>

<script>
  import Setup from '@/components//Setup'
  import IsConnected from '../mixins/IsConnected'

  export default {
    name: 'content-or-setup',
    components: {
      Setup
    },
    mixins: [
      IsConnected
    ]
  }
</script>
