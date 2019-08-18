<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">
        Rest
        <v-btn class="text-transform--none ml-2" small
               href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html" target="_blank"
               text>
          <v-icon small>mdi-launch</v-icon>&nbsp;
          api documentation
        </v-btn>
      </h1>
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
