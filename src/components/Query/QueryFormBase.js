import { REQUEST_DEFAULTS } from '../../consts'

export default {
  name: 'query-form-base',
  data () {
    return {
      loading: false,
      methods: [],
      hasError: false,
      response: {},
      TYPES: ['cat', 'close', 'cluster', 'indices', 'ingest', 'nodes', 'snapshot', 'tasks', 'transport']
    }
  },
  computed: {
    apiDocumentationUrl () {
      return this.method ? `https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-${this.method.replace('.', '-')}` : null
    },
    isValid () {
      return !!this.method && !this.hasError && this.host.length > 0
    },
    host: {
      get () {
        return this.$store.state.query.host
      },
      set (host) {
        this.$store.commit('setQueryHost', host)
      }
    },
    method: {
      get () {
        return this.$store.state.query.method
      },
      set (method) {
        this.$store.commit('setQueryMethod', method)
      }
    },
    stringifiedParams: {
      get () {
        return this.$store.state.query.stringifiedParams
      },
      set (params) {
        this.$store.commit('setQueryStringifiedParams', params)
      }
    }
  },
  methods: {
    loadData () {
      this.loading = true
      this.getElasticsearchAdapter()
        .then(adapter => {
          const methodSplit = this.method.split('.')
          if (methodSplit.length === 1) {
            return adapter.client[methodSplit](this.parsedParams())
          } else {
            return adapter.client[methodSplit[0]][methodSplit[1]](this.parsedParams())
          }
        })
        .then(response => {
          this.loading = false
          this.response = response
        })
        .catch(error => {
          this.response = error.message
          this.loading = false
          this.showErrorSnackbar({text: 'Error:', additionalText: error.message})
        })
    },
    getMethods () {
      this.getElasticsearchAdapter().then(adapter => {
        let client = adapter.client

        this.methods.push({header: 'general'})
        for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(client))) {
          let method = client[name]
          if (typeof method !== 'function') continue
          this.methods.push({name})
        }

        for (let type of this.TYPES) {
          let clientTypeObject = client[type]
          this.methods.push({header: type})
          for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(clientTypeObject))) {
            let method = clientTypeObject[name]
            if (typeof method !== 'function') continue
            this.methods.push({name: `${type}.${name}`})
          }
        }
      })
    },
    parsedParams () {
      try {
        return JSON.parse(this.stringifiedParams)
      } catch (error) {
        return REQUEST_DEFAULTS
      }
    }
  },
  created () {
    this.getMethods()
    this.host = this.$store.state.connection.elasticsearchHost
  }
}
