<template>
  <div v-if="settings.length > 0" class="mb-1 pb-2">
    <slot name="multi-setting__header">
      <v-subheader>
        <span class="mr-2">{{ name }}</span>
        <v-btn v-if="!unchecked" class="ml-a px-1" small text @click.native="uncheckAll">
          {{ $t('shared.table_settings.uncheck') }}
        </v-btn>
        <v-btn v-if="hasChanges" class="ml-a px-1" small text @click.native="reset">
          {{ $t('shared.table_settings.reset') }}
        </v-btn>
      </v-subheader>
    </slot>

    <div v-for="setting in settings" :key="setting">
      <slot name="multi-setting__item">
        <div class="px-4">
          <v-checkbox v-model="ownValue"
                      :label="setting"
                      :value="setting"
                      class="my-0 v-input--checkbox--full-labels"
                      color="primary-button"
                      hide-details/>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
  import { computed, ref, watch } from 'vue'

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
      const unchecked = computed(() => {
        return ownValue.value.length === 0
      })

      const updateValue = () => {
        context.emit('input', ownValue.value)
      }

      watch(() => ownValue.value, updateValue)
      const reset = () => (ownValue.value = props.settings)
      const uncheckAll = () => {
        ownValue.value = []
      }

      return {
        ownValue,
        hasChanges,
        reset,
        uncheckAll,
        unchecked
      }
    }
  }
</script>
