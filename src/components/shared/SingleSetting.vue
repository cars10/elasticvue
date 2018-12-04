<template>
  <div>
    <slot name="single-setting__item">
      <v-flex px-3>
        <v-checkbox :value="value"
                    :label="name"
                    v-model="ownValue"
                    hide-details class="mt-2 mb-0"/>
      </v-flex>
    </slot>
  </div>
</template>

<script>
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
    data () {
      return {
        ownValue: this.value
      }
    },
    watch: {
      ownValue () {
        this.updateValue()
      }
    },
    methods: {
      updateValue () {
        this.$emit('input', !!this.ownValue)
      }
    }
  }
</script>
