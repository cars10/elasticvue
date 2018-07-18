<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Query</h1>
    </v-card-title>
    <v-divider/>
    <v-card-text>
      <fetch-form/>
    </v-card-text>
  </v-card>
</template>

<script>
  import FetchForm from '@/components/Query/FetchForm'

  export default {
    name: 'Query',
    components: {
      FetchForm
    }
  }
</script>
