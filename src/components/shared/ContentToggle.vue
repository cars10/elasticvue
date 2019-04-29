<template>
  <div class="content-toggle">
    <div v-if="firstActive" ref="first" class="content-toggle__item flex pa-0">
      <div class="grow">
        <slot name="first">first</slot>
      </div>
      <span class="align-self-center content-toggle__last_activator" @click="setLast">
        <slot name="last-activator">Use last</slot>
      </span>
    </div>

    <div v-else ref="last" class="content-toggle__item flex pa-0">
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
    data () {
      return {
        firstActive: true
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
