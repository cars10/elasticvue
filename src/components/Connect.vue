<template>
  <div>
    <form v-on:submit.prevent="connectWithClient()">
      <input type="text" name="host" id="host" v-model="elasticsearchHost">
      <button type="submit">Connect</button>
    </form>
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
