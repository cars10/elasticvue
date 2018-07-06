const FixedHeaderTable = {
  methods: {
    updateFixedHeaderTableHeight () {
      const height = window.innerHeight
      const initialTableHeight = 800
      const minHeight = 300
      const offset = 120
      const requiredTableHeight = height - offset

      if (requiredTableHeight < initialTableHeight && requiredTableHeight > minHeight) {
        document.querySelector('.fixed-header .v-table__overflow').style.maxHeight = `${requiredTableHeight}px`
      }
    },
    fixedHeaderTableOnMount () {
      // call in mounted
      if (typeof window !== 'undefined') {
        this.updateFixedHeaderTableHeight()
        window.addEventListener('resize', this.updateFixedHeaderTableHeight)
      }
    },
    fixedHeaderTableOnBeforeDestroy () {
      // call in beforeDestroy
      window.removeEventListener('resize', this.updateFixedHeaderTableHeight)
    }
  }
}

export default FixedHeaderTable
