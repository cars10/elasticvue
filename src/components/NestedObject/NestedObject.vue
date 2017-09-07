<template>
  <div class="nested_object">
    <identifier :identifier="this.openingIdentifier"></identifier>
    <div v-for="(value, key) in object">
      <object-key-value :object_key="key" :object_value="value"></object-key-value>
    </div>
    <identifier :identifier="this.closingIdentifier"></identifier>
  </div>
</template>

<script>
  import Identifier from '@/components/NestedObject/Identifier'
  import ObjectKey from '@/components/NestedObject/ObjectKey'

  export default {
    props: {
      objectOpeningIdentifier: {
        type: String,
        default: '{'
      },
      objectClosingIdentifier: {
        type: String,
        default: '}'
      },
      arrayOpeningIdentifier: {
        type: String,
        default: '['
      },
      arrayClosingIdentifier: {
        type: String,
        default: ']'
      },
      object: {
        default: () => {
          return {test: 'value', asd: 'qwe', obj: {name: 'carsten'}, arr: [1, 2]}
        }
      }
    },
    components: {
      Identifier,
      ObjectKey
    },
    beforeCreate: function () {
      // import the component like that because otherwise vue does not know how to resolve the dependency
      this.$options.components.ObjectKeyValue = require('./ObjectKeyValue.vue')
    },
    computed: {
      openingIdentifier () {
        return Array.isArray(this.object) ? this.arrayOpeningIdentifier : this.objectOpeningIdentifier
      },
      closingIdentifier () {
        return Array.isArray(this.object) ? this.arrayClosingIdentifier : this.objectClosingIdentifier
      }
    }
  }
</script>

<style scoped>
  .nested_object {
    margin-left: 2em;
    display: inline-block;
  }
</style>
