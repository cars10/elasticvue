<template>
  <div>
    <div :style="style" ref="resizedWrapper">
      <slot></slot>
    </div>

    <v-flex right d-inline-flex my-2>
      <btn-group small>
        <v-btn flat
               ref="decreaseHeightButton"
               :disabled="!canDecreseHeight"
               title="Decrease height"
               @click.native="decreaseHeight">
          <v-icon>arrow_upward</v-icon>
        </v-btn>
        <v-btn flat
               ref="increaseHeightButton"
               title="Increase height"
               @click.native="increaseHeight">
          <v-icon>arrow_downward</v-icon>
        </v-btn>
        <v-btn flat
               class="v-btn--dense ma-0"
               title="Resize"
               @mousedown="onDragStart">
          <v-icon>vertical_align_center</v-icon>
        </v-btn>
      </btn-group>
    </v-flex>
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
      },
      canDecreseHeight () {
        return (this.height - this.stepSize) >= this.initialHeight
      }
    },
    methods: {
      increaseHeight () {
        this.height += this.stepSize
        this.triggerResizeAndFocusRef('increaseHeightButton')
      },
      decreaseHeight () {
        if (this.canDecreseHeight) this.height -= this.stepSize
        this.triggerResizeAndFocusRef('decreaseHeightButton')
      },
      triggerResizeAndFocusRef (ref) {
        this.$nextTick(() => {
          if (window !== undefined) {
            this.triggerResize()
          }
          this.$refs[ref].$el.focus()
        })
      },
      triggerResize () {
        window.dispatchEvent(new Event('resize'))
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
