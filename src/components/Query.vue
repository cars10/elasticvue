<template>
  <v-layout>
    <v-flex xl8 offset-xl2>
      <v-card>
        <v-card-title>
          <h1 class="headline">Query</h1>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <fetch-form></fetch-form>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
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
