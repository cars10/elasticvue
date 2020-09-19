<template>
  <div v-if="settings.length > 0" class="mb-1">
    <slot name="multi-setting__header">
      <v-subheader>
        {{ name }}
        <v-btn v-if="hasChanges" class="ml-a grey--text mr-0 pr-0" small text @click.native="reset">
          reset
          <v-icon>mdi-clear</v-icon>
        </v-btn>
      </v-subheader>
    </slot>

    <div v-for="setting in settings" :key="setting">
      <slot name="multi-setting__item">
        <div class="px-4">
          <v-checkbox :label="setting"
                      :value="setting"
                      v-model="ownValue"
                      color="primary"
                      class="my-0 v-input--checkbox--full-labels" hide-details/>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
  import { computed, ref, watch } from '@vue/composition-api'

  export default {
    name: 'multi-settings',
    props: {
      name: {
        type: String,
        default: ''
      },
      value: {
        type: Array,
        default: () => []
      },
      settings: {
        type: Array,
        default: () => []
      }
    },
    setup (props, context) {
      const ownValue = ref(props.value)
      const hasChanges = computed(() => {
        return props.settings.length !== props.value.length
      })

      const updateValue = () => {
        context.emit('input', ownValue.value)
      }

      watch(() => ownValue.value, updateValue)
      const reset = () => (ownValue.value = props.settings)

      return {
        ownValue,
        hasChanges,
        reset
      }
    }
  }
</script>
