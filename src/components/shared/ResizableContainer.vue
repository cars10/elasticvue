<template>
  <div>
    <div :style="style" ref="resizedWrapper" class="position--relative">
      <slot></slot>

      <v-btn flat
             class="v-btn-absolute-bottom-right"
             title="Resize"
             @mousedown="onDragStart">
        <v-icon>vertical_align_center</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'

  export default {
    name: 'resizable-container',
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
        if (window !== undefined) window.dispatchEvent(new Event('resize'))
      },
      onDragStart (e) {
        this.resizing = true
        this.dragStartY = e.pageY
        this.dragStartHeight = this.height
      },
      onDrag (e) {
        if (this.resizing) {
          const newHeight = this.dragStartHeight + e.pageY - this.dragStartY
          if (newHeight > this.initialHeight) this.height = newHeight
        }
      },
      onDragEnd () {
        this.resizing = false
        this.dragStartY = 0
        this.$nextTick(() => {
          if (window !== undefined) {
            this.triggerResize()
          }
        })
      }
    },
    mounted () {
      if (window !== undefined) {
        window.addEventListener('mouseup', this.onDragEnd)
        window.addEventListener('mousemove', this.onDrag)
      }
    },
    destroyed () {
      if (window !== undefined) {
        window.removeEventListener('mouseup', this.onDragEnd)
        window.removeEventListener('mousemove', this.onDrag)
      }
    },
    components: {
      BtnGroup
    }
  }
</script>
