<template>
  <div class="hello">
    <input type="text" name="host" id="host" v-model="host">
    <select name="versions" id="versions" v-model="elasticsearchVersion">
      <option :value="version" v-for="version in versions">{{version}}</option>
    </select>
    <button @click="connect()">Connect</button>
  </div>
</template>

<script>
  import ConnectService from '../services/elasticsearch/ConnectService'
  import { ELASTICSEARCH_API_VERSIONS } from '../consts'

  export default {
    data () {
      return {
        host: 'localhost:9200',
        versions: ELASTICSEARCH_API_VERSIONS
      }
    },
    methods: {
      connect () {
        let connectService = new ConnectService(this.host, this.$store.state.elasticsearchVersion)
        connectService.connect().then(
          client => this.$store.commit('setElasticsearchClient', client),
          error => console.log(error)
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
      }
    }
  }
</script>
