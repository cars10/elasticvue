<template>
  <div v-if="settings.length > 0" class="mb-1">
    <slot name="multi-setting__header">
      <v-subheader>
        {{name}}
        <v-btn v-if="hasChanges" class="ml-a grey--text mr-0 pr-0" small flat @click.native="reset">
          reset
          <v-icon>clear</v-icon>
        </v-btn>
      </v-subheader>
    </slot>

    <div v-for="setting in settings" :key="setting">
      <slot name="multi-setting__item">
        <v-flex px-3>
          <v-checkbox :value="setting"
                      :label="setting"
                      v-model="ownValue"
                      hide-details class="my-0 v-input--checkbox--full-labels"/>
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
        type: Array,
        default: () => []
      }
    },
    data () {
      return {
        ownValue: this.value
      }
    },
    computed: {
      hasChanges () {
        return this.settings.length !== this.value.length
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
      },
      reset () {
        this.ownValue = this.settings
      }
    }
  }
</script>
