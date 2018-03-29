<template>
  <div v-if="isConnected()">
    <slot></slot>
  </div>

  <div class="p3" v-else>
    <connect></connect>
  </div>
</template>

<script>
  import Connect from '@/components/Connect'
  import IsConnected from './../mixins/IsConnected'

  export default {
    components: {
      Connect
    },
    mixins: [IsConnected]
  }
</script>
