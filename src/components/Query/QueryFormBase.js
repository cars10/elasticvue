export default {
  name: 'query-form-base',
  data () {
    return {
      loading: false,
      hasError: false,
      response: {}
    }
  },
  computed: {
    host: {
      get () {
        return this.$store.state.query.host
      },
      set (host) {
        this.$store.commit('query/setHost', host)
      }
    },
    method: {
      get () {
        return this.$store.state.query.method
      },
      set (method) {
        this.$store.commit('query/setMethod', method)
      }
    },
    stringifiedParams: {
      get () {
        return this.$store.state.query.stringifiedParams
      },
      set (params) {
        this.$store.commit('query/setStringifiedParams', params)
      }
    },
    stringifiedHeaders: {
      get () {
        return this.$store.state.query.stringifiedHeaders
      },
      set (params) {
        this.$store.commit('query/setStringifiedHeaders', params)
      }
    }
  }
}
