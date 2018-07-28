<template>
  <div v-if="isConnected || wasConnected">
    <slot/>
  </div>
  <setup v-else/>
</template>

<script>
  import Setup from '@/components//Setup'
  import ConnectionStatus from '@/mixins/ConnectionStatus'

  export default {
    name: 'content-or-setup',
    components: {
      Setup
    },
    mixins: [
      ConnectionStatus
    ]
  }
</script>
