const FixedTableHeader = {
  mounted () {
    this.fixedTableHeaderOnEnable()
  },
  beforeDestroy () {
    this.fixedTableHeaderOnDisable()
  },
  methods: {
    updateFixedTableHeaderHeight () {
      const header = document.querySelector('.table--fixed-header .v-table__overflow')
      if (header) {
        const height = window.innerHeight
        const minHeight = 300
        const offset = 100
        const requiredTableHeight = height - offset

        if (requiredTableHeight > minHeight) {
          header.style.maxHeight = `${requiredTableHeight}px`
        }
      }
    },
    resetTableHeight () {
      const header = document.querySelector('.table--fixed-header .v-table__overflow')
      if (header) {
        header.style.maxHeight = ''
      }
    },
    fixedTableHeaderOnEnable () {
      if (typeof window !== 'undefined') {
        this.updateFixedTableHeaderHeight()
        window.addEventListener('resize', this.updateFixedTableHeaderHeight)
      }
    },
    fixedTableHeaderOnDisable () {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this.updateFixedTableHeaderHeight)
      }
    }
  }
}

export default FixedTableHeader
