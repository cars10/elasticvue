<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">API Browser</h1>
    </v-card-title>
    <v-divider/>
    <v-card-text>
      <api-browser/>
    </v-card-text>
  </v-card>
</template>

<script>
  import ApiBrowser from '@/components/Query/ApiBrowser/ApiBrowser'

  export default {
    name: 'QueryApiBrowser',
    components: {
      ApiBrowser
    }
  }
</script>
