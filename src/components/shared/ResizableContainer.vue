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
        height: this.initialHeight
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
      }
    },
    components: {
      BtnGroup
    }
  }
</script>
