export default {
  methods: {
    showSnackbar (props) {
      this.$store.commit('snackbar/show', props)
    },
    showSuccessSnackbar (props) {
      this.$store.commit('snackbar/show', Object.assign({}, {timeout: 5000, color: 'success'}, props))
    },
    showErrorSnackbar (props) {
      this.$store.commit('snackbar/show', Object.assign({}, {timeout: 10000, color: 'error'}, props))
    }
  }
}
