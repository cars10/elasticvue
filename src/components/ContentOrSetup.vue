<template>
  <div v-if="isConnected || wasConnected">
    <slot/>
  </div>
  <setup v-else/>
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
