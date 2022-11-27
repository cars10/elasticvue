<template>
  <div ref="resizedWrapper" :style="style" class="resizable-container">
    <slot/>

    <div class="resizable-container__vertical-handler" @mousedown="onDragStart"/>
  </div>
</template>

<script>
  import Vue, { computed, ref, watch } from 'vue'

  export default {
    name: 'resizable-container',
    props: {
      initialHeight: {
        default: 350,
        type: Number
      },
      stepSize: {
        default: 150,
        type: Number
      }
    },
    setup (props) {
      const height = ref(props.initialHeight)
      let dragStartY = 0
      /* eslint-disable vue/no-setup-props-destructure */
      let dragStartHeight = props.initialHeight
      let resizing = false

      watch(() => props.initialHeight, newHeight => {
        height.value = newHeight
      })

      const style = computed(() => {
        return `width: 100%; height: ${height.value}px`
      })

      const triggerResize = () => {
        if (typeof window === 'undefined') return
        window.dispatchEvent(new Event('resize'))
      }

      const onDragStart = e => {
        window.addEventListener('mouseup', onDragEnd)
        window.addEventListener('mousemove', onDrag)
        resizing = true
        dragStartY = e.pageY
        dragStartHeight = height.value
      }

      const onDrag = e => {
        if (resizing) {
          const newHeight = dragStartHeight + e.pageY - dragStartY
          if (newHeight > props.initialHeight) {
            height.value = newHeight
            const distanceToTop = e.clientY
            const distanceToBottom = window.innerHeight - e.clientY
            const scrollOffset = 100
            if (distanceToBottom < scrollOffset) {
              // scroll down automatically
              window.scrollBy(0, scrollOffset - distanceToBottom)
            } else if (distanceToTop < 100) {
              // scroll up automatically
              window.scrollBy(0, -(scrollOffset - distanceToTop))
            }
          }
        }
      }

      const onDragEnd = () => {
        resizing = false
        dragStartY = 0
        Vue.nextTick(() => {
          if (typeof window !== 'undefined') {
            triggerResize()
          }
        })
        window.removeEventListener('mouseup', onDragEnd)
        window.removeEventListener('mousemove', onDrag)
      }

      return {
        style,
        onDragStart
      }
    }
  }
</script>
