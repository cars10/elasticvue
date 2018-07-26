<template>
  <div class="mb-2">
    <slot name="multi-setting__header">
      <v-subheader>{{name}}</v-subheader>
    </slot>

    <div v-for="key in Object.keys(settings)" :key="key">
      <slot name="multi-setting__item">
        <v-flex px-3>
          <v-checkbox :value="settings[key].value"
                      :label="settings[key].text"
                      v-model="ownValue"
                      hide-details class="mt-2 mb-1"/>
        </v-flex>
      </slot>
    </div>
  </div>
</template>

<script>
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
        type: Object,
        default: () => {
        }
      }
    },
    data () {
      return {
        ownValue: []
      }
    },
    watch: {
      ownValue () {
        this.updateValue()
      }
    },
    methods: {
      updateValue () {
        this.$emit('input', this.ownValue)
      }
    }
  }
</script>
