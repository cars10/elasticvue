<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Query</h1>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-tabs>
        <v-tab key="js">js client</v-tab>
        <v-tab key="fetch" disabled>fetch/curl</v-tab>

        <v-tab-item key="js">
          <v-flex pa-3>
            <js-api-form></js-api-form>
          </v-flex>
        </v-tab-item>

        <v-tab-item key="fetch">
          <v-flex pa-3>
            <fetch-form></fetch-form>
          </v-flex>
        </v-tab-item>
      </v-tabs>
    </v-card-text>
  </v-card>
</template>

<script>
  import JsApiForm from '@/components/Query/JsApiForm'
  import FetchForm from '@/components/Query/FetchForm'

  export default {
    name: 'Query',
    components: {
      JsApiForm,
      FetchForm
    }
  }
</script>
