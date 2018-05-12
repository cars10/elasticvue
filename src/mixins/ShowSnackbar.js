export default {
  methods: {
    showSnackbar (props) {
      this.$store.commit('showSnackbar', props)
    },
    showSuccessSnackbar (props) {
      this.$store.commit('showSnackbar', Object.assign({}, {timeout: 5000, color: 'success'}, props))
    },
    showErrorSnackbar (props) {
      this.$store.commit('showSnackbar', Object.assign({}, {timeout: 7000, color: 'error'}, props))
    }
  }
}
