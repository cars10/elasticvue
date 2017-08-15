<template>
  <div>
    <form v-on:submit.prevent="connect()">
      <input type="text" name="host" id="host" v-model="elasticsearchHost">
      <select name="versions" id="versions" v-model="elasticsearchVersion">
        <option :value="version" v-for="version in versions">{{version}}</option>
      </select>
      <button type="submit">Connect</button>
    </form>
  </div>
</template>

<script>
  import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
  import ConnectService from '../services/elasticsearch/ConnectService'
  import { ELASTICSEARCH_API_VERSIONS } from '../consts'

  export default {
    data () {
      return {
        versions: ELASTICSEARCH_API_VERSIONS
      }
    },
    methods: {
      connect () {
        let connectService = new ConnectService(this.host, this.$store.state.elasticsearchVersion)
        connectService.connect().then(
          client => {
            this.$store.commit('setElasticsearchClient', client)
            let adapter = new ElasticsearchAdapter(client)
            adapter.getCatIndices().then(
              body => {
                this.$store.commit('setIndices', body)
              },
              error => console.error('error', error)
            )
          },
          () => this.$store.commit('setErrorState')
        )
      }
    },
    computed: {
      elasticsearchVersion: {
        get () {
          return this.$store.state.elasticsearchVersion
        },
        set (value) {
          this.$store.commit('setElasticsearchVersion', value)
        }
      },
      elasticsearchHost: {
        get () {
          return this.$store.state.elasticsearchHost
        },
        set (value) {
          this.$store.commit('setElasticsearchHost', value)
        }
      }
    }
  }
</script>
