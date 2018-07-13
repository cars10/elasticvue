import { mapVuexAccessors } from '../../helpers/store'

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
    ...mapVuexAccessors('query', ['host', 'method', 'stringifiedParams', 'stringifiedHeaders'])
  }
}
