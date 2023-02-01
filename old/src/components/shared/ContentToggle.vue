<template>
  <div class="width--full">
    <div v-if="firstActive" ref="first" class="display--flex vertical-align--top flex pa-0">
      <div class="grow">
        <slot name="first">first</slot>
      </div>
      <span class="align-self-center content-toggle__last_activator" @click="setLast">
        <slot name="last-activator">use last</slot>
      </span>
    </div>

    <div v-else ref="last" class="display--flex vertical-align--top flex pa-0">
      <div class="grow">
        <slot name="last">last</slot>
      </div>
      <span class="align-self-center content-toggle__first_activator" @click="setFirst">
        <slot name="first-activator">use first</slot>
      </span>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue'

  export default {
    name: 'content-toggle',
    props: {
      firstSlotActive: {
        type: Boolean,
        default: true
      }
    },
    setup (props, context) {
      const firstActive = ref(props.firstSlotActive)
      const setFirst = () => {
        firstActive.value = true
        context.emit('changed', firstActive.value)
      }

      const setLast = () => {
        firstActive.value = false
        context.emit('changed', firstActive.value)
      }

      return {
        firstActive,
        setFirst,
        setLast
      }
    }
  }
</script>
