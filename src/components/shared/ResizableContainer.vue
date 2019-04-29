<template>
  <div ref="resizedWrapper" :style="style" class="resizable-container">
    <slot/>

    <div class="resizable-container__vertical-handler" @mousedown="onDragStart"/>
  </div>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'

  export default {
    name: 'resizable-container',
    components: {
      BtnGroup
    },
    props: {
      initialWidth: {
        default: '100%',
        type: String
      },
      initialHeight: {
        default: 350,
        type: Number
      },
      stepSize: {
        default: 150,
        type: Number
      }
    },
    data () {
      return {
        width: this.initialWidth,
        height: this.initialHeight,
        dragStartY: 0,
        dragStartHeight: this.initialHeight,
        resizing: false
      }
    },
    computed: {
      style () {
        return `width: ${this.width}; height: ${this.height}px`
      }
    },
    methods: {
      triggerResize () {
        if (typeof window === 'undefined') return
        window.dispatchEvent(new Event('resize'))
      },
      onDragStart (e) {
        window.addEventListener('mouseup', this.onDragEnd)
        window.addEventListener('mousemove', this.onDrag)
        this.resizing = true
        this.dragStartY = e.pageY
        this.dragStartHeight = this.height
      },
      onDrag (e) {
        if (this.resizing) {
          const newHeight = this.dragStartHeight + e.pageY - this.dragStartY
          if (newHeight > this.initialHeight) {
            this.height = newHeight
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
      },
      onDragEnd () {
        this.resizing = false
        this.dragStartY = 0
        this.$nextTick(() => {
          if (typeof window !== 'undefined') {
            this.triggerResize()
          }
        })
        window.removeEventListener('mouseup', this.onDragEnd)
        window.removeEventListener('mousemove', this.onDrag)
      }
    }
  }
</script>
