export const resetTableHeight = function () {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const header = document.querySelector('.table--fixed-header .v-table__overflow')
  if (header) header.style.maxHeight = ''
}

// call in mounted
export const fixedTableHeaderOnEnable = function () {
  if (typeof window === 'undefined') return
  updateFixedTableHeaderHeight()
  window.addEventListener('resize', updateFixedTableHeaderHeight)
}

// call in beforeDestroy
export const fixedTableHeaderOnDisable = function () {
  if (typeof window === 'undefined') return
  window.removeEventListener('resize', updateFixedTableHeaderHeight)
}

const updateFixedTableHeaderHeight = function () {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
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
}
