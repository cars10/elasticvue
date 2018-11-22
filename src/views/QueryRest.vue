<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Rest Query</h1>
    </v-card-title>
    <v-divider/>
    <v-card-text>
      <fetch-form/>
    </v-card-text>
  </v-card>
</template>

<script>
  import FetchForm from '@/components/Query/Rest/FetchForm'

  export default {
    name: 'QueryRest',
    components: {
      FetchForm
    }
  }
</script>
