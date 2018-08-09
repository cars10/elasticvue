import { mapVuexAccessors } from '../../helpers/store'

export default {
  name: 'query-form-base',
  data () {
    return {
      loading: false,
      hasError: false,
      response: {},
      elasticsearchHost: this.$store.state.connection.elasticsearchHost
    }
  },
  computed: {
    ...mapVuexAccessors('query', ['method', 'stringifiedParams', 'stringifiedHeaders'])
  }
}
