<template>
  <div>
    <form v-on:submit.prevent="connectWithClient()">
      <input type="text" name="host" id="host" v-model="elasticsearchHost">
      <select name="versions" id="versions" v-model="elasticsearchVersion">
        <option :value="version" v-for="version in versions">{{version}}</option>
      </select>
      <button type="submit">Connect</button>
    </form>
  </div>
</template>

<script>
  import { ELASTICSEARCH_API_VERSIONS } from '../consts'
  import ConnectMixin from '../mixins/ConnectMixin'

  export default {
    data () {
      return {
        versions: ELASTICSEARCH_API_VERSIONS
      }
    },
    mixins: [ConnectMixin],
    computed: {
      elasticsearchVersion: {
        get () {
          return this.$store.state.connection.elasticsearchVersion
        },
        set (value) {
          this.$store.commit('setElasticsearchVersion', value)
        }
      },
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
