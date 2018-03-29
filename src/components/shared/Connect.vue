<template>
  <v-form v-on:submit.prevent="connectWithClient()">
    <v-flex text-xs-center>
      <input title="host" type="text" id="host" v-model="elasticsearchHost">
      <v-btn type="submit">Connect</v-btn>
    </v-flex>
  </v-form>
</template>

<script>
  import ConnectMixin from '../../mixins/ConnectMixin'

  export default {
    mixins: [ConnectMixin],
    computed: {
      elasticsearchHost: {
        get () {
          return this.$store.state.connection.elasticsearchHost
        },
        set (value) {
          this.$store.commit('setElasticsearchHost', value)
        }
      }
    }
  }
</script>
