const FixedTableHeader = {
  methods: {
    updateFixedTableHeaderHeight () {
      const height = window.innerHeight
      const minHeight = 300
      const offset = 100
      const requiredTableHeight = height - offset

      if (requiredTableHeight > minHeight) {
        document.querySelector('.table--fixed-header .v-table__overflow').style.maxHeight = `${requiredTableHeight}px`
      }
    },
    fixedTableHeaderOnEnable () {
      // call in mounted
      if (typeof window !== 'undefined') {
        this.updateFixedTableHeaderHeight()
        window.addEventListener('resize', this.updateFixedTableHeaderHeight)
      }
    },
    fixedTableHeaderOnDisable () {
      // call in beforeDestroy
      window.removeEventListener('resize', this.updateFixedTableHeaderHeight)
    }
  }
}

export default FixedTableHeader
