import { CONNECTION_STATES } from '../consts'

const IsConnected = {
  methods: {
    isConnected () {
      return (this.$store.state.connection.elasticsearchClient != null) &&
        (this.$store.state.connection.status === CONNECTION_STATES.SUCCESS)
    },
    wasConnected () {
      return this.$store.state.connection.wasConnected
    }
  }
}

export default IsConnected
