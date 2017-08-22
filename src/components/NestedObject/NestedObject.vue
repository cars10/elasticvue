<template>
  <div>
    <identifier :identifier="objectOpeningIdentifier"></identifier>
    <identifier :identifier="objectClosingIdentifier"></identifier>
  </div>
</template>

<script>
  import Identifier from '@/components/NestedObject/Identifier'

  export default {
    name: 'NestedObject',
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
      classesPrefix: {
        type: String,
        default: 'nested_object__'
      }
    },
    data () {
      return {
        object: {
          key1: '1test',
          key2: null,
          nest: {key3: 3, key4: 4, nest2: {key5: 5}},
          array: [1, {object: 1}, [1, 2, [3, 4]]]
        },
        printedObject: 'nix'
      }
    },
    methods: {
      printObject (object, SomeBool) {
        return 'yolo'
      }
    },
    created () {
      console.log('nix')
    },
    components: {
      Identifier
    }
  }
</script>
