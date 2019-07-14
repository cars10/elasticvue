<template>
  <div class="width--full">
    <div v-if="firstActive" ref="first" class="display--flex vertical-align--top flex pa-0">
      <div class="grow">
        <slot name="first">first</slot>
      </div>
      <span class="align-self-center content-toggle__last_activator" @click="setLast">
        <slot name="last-activator">Use last</slot>
      </span>
    </div>

    <div v-else ref="last" class="display--flex vertical-align--top flex pa-0">
      <div class="grow">
        <slot name="last">last</slot>
      </div>
      <span class="align-self-center content-toggle__first_activator" @click="setFirst">
        <slot name="first-activator">Use first</slot>
      </span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'content-toggle',
    props: {
      firstSlotActive: {
        type: Boolean,
        default: true
      }
    },
    data () {
      return {
        firstActive: this.firstSlotActive
      }
    },
    methods: {
      setFirst () {
        this.firstActive = true
        this.$emit('changed', this.firstActive)
      },
      setLast () {
        this.firstActive = false
        this.$emit('changed', this.firstActive)
      }
    }
  }
</script>
