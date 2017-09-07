<template>
  <div class="nested_object--object_key_value">
    <object-key :object_key="object_key"></object-key>
    <nested-object v-if="typeof object_value === 'object'" :object="object_value"></nested-object>
    <object-value v-else :object_value="object_value"></object-value>
  </div>
</template>

<script>
  import ObjectKey from '@/components/NestedObject/ObjectKey'
  import ObjectValue from '@/components/NestedObject/ObjectValue'
  import NestedObject from '@/components/NestedObject/NestedObject'

  export default {
    props: [
      'object_key',
      'object_value'
    ],
    components: {
      ObjectKey,
      ObjectValue,
      NestedObject
    }
  }
</script>

<style scoped>
  .nested_object--object_key_value {
    margin-left: 2em;
    display: inline-block;
  }
</style>
