<template>
  <div>
    <v-form v-on:submit.prevent="connectWithClient()">
      <input type="text" name="host" id="host" v-model="elasticsearchHost">
      <v-btn type="submit">Connect</v-btn>
    </v-form>
  </div>
</template>

<script>
  import ConnectMixin from '../mixins/ConnectMixin'

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
