<template>
  <div class="mb-1 pb-2">
    <slot name="single-setting__item">
      <div class="px-4">
        <v-checkbox v-model="ownValue"
                    :label="name"
                    :value="value"
                    class="my-0 v-input--checkbox--full-labels"
                    color="primary-button"
                    hide-details/>
      </div>
    </slot>
  </div>
</template>

<script>
  import { ref, watch } from 'vue'

  export default {
    name: 'single-settings',
    props: {
      name: {
        type: String,
        default: ''
      },
      value: {
        type: Boolean,
        default: false
      }
    },
    setup (props, context) {
      const ownValue = ref(props.value)
      const updateValue = () => {
        context.emit('input', ownValue.value)
      }
      watch(() => ownValue.value, updateValue)

      return {
        ownValue
      }
    }
  }
</script>
