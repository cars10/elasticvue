import esAdapter from '@/mixins/GetAdapter'

export default {
  data () {
    return {
      loading: false,
      networkError: false,
      apiError: false,
      apiErrorMessage: false,
      response: {},
      body: null
    }
  },
  computed: {
    hasAnyError () {
      return this.networkError || this.apiError
    }
  },
  methods: {
    async callElasticsearch (method, params, rejectOnError) {
      this._setStartRequestData()

      try {
        const adapter = await esAdapter()
        await adapter.ping()

        try {
          return this._callMethod(adapter, method, params)
        } catch (error) {
          return this._handleApiError(error, rejectOnError)
        }
      } catch (error) {
        return this._handleNetworkError(rejectOnError)
      }
    },
    _setStartRequestData () {
      this.loading = true
      this.networkError = false
      this.apiError = false
      this.apiErrorMessage = false
      this.response = {}
    },
    _setStopRequestData () {
      this.loading = false
      this.networkError = false
      this.apiError = false
      this.apiErrorMessage = false
    },
    _setApiError (error) {
      this.loading = false
      this.networkError = false
      this.apiError = true
      this.apiErrorMessage = error.message
      this.response = {}
    },
    _setNetworkError () {
      this.loading = false
      this.networkError = true
      this.apiError = false
      this.apiErrorMessage = false
      this.response = {}
    },
    async _callMethod (adapter, method, params) {
      const response = await adapter[method](params)
      this._setStopRequestData()
      this.$store.commit('connection/setConnected')
      return Promise.resolve(response)
    },
    _handleApiError (error, rejectOnError) {
      this._setApiError(error)
      this.showErrorSnackbar({ text: 'Error:', additionalText: error.message })
      if (rejectOnError) return Promise.reject(Error('API Error'))
    },
    _handleNetworkError (rejectOnError) {
      this._setNetworkError()
      this.$store.commit('connection/setDisconnected')
      if (rejectOnError) return Promise.reject(Error('Network Error'))
    }
  }
}
