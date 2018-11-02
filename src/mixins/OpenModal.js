export default {
  methods: {
    openModal (options) {
      this.$store.commit('modal/setModalOpen', true)
      this.$store.commit('modal/setMethod', options.method)
      this.$store.commit('modal/setMethodParams', options.methodParams)
      this.$store.commit('modal/setTitle', options.title)
      this.$store.commit('modal/setSubtitle', options.subtitle)
    },
    closeModal () {
      this.$store.commit('modal/open', false)
    }
  }
}
