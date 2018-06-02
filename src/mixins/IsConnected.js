import { CONNECTION_STATES } from '../consts'

const IsConnected = {
  computed: {
    isConnected () {
      return this.$store.state.connection.status === CONNECTION_STATES.SUCCESS
    },
    wasConnected () {
      return this.$store.state.connection.wasConnected
    }
  }
}

export default IsConnected
