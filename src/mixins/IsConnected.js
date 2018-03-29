import { CONNECTION_STATES } from '../consts'

const IsConnected = {
  methods: {
    isConnected () {
      return (this.$store.state.connection.elasticsearchClient != null) &&
        (this.$store.state.connection.status === CONNECTION_STATES.SUCCESS)
    }
  }
}

export default IsConnected
