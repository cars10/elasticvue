export default {
  methods: {
    showSnackbar (props) {
      this.$store.commit('showSnackbar', props)
    }
  }
}
