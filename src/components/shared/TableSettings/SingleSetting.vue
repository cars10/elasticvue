<template>
  <div>
    <slot name="single-setting__item">
      <div class="px-4">
        <v-checkbox :label="name"
                    :value="value"
                    v-model="ownValue"
                    color="primary"
                    class="mt-0 mb-0" hide-details/>
      </div>
    </slot>
  </div>
</template>

<script>
  import { ref, watch } from '@vue/composition-api'

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
        context.emit('input', !!ownValue.value)
      }

      watch(() => ownValue.value, updateValue)

      return {
        ownValue
      }
    }
  }
</script>
