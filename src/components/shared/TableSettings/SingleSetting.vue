<template>
  <div>
    <slot name="single-setting__item">
      <v-col class="px-4">
        <v-checkbox :label="name"
                    :value="value"
                    v-model="ownValue"
                    class="mt-2 mb-0" hide-details/>
      </v-col>
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
