export const resetTableHeight = function () {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const wrapper = document.querySelector('.table--fixed-header .v-data-table__wrapper')
  if (wrapper) wrapper.style.maxHeight = ''
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

export const updateFixedTableHeaderHeight = function () {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const wrapper = document.querySelector('.table--fixed-header .v-data-table__wrapper')
  if (wrapper) {
    const height = window.innerHeight
    const minHeight = 300
    const offset = 200
    const requiredTableHeight = height - offset

    if (requiredTableHeight > minHeight) {
      wrapper.style.maxHeight = `${requiredTableHeight}px`
    }
  }
}
