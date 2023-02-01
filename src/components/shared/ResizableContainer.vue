<template>
  <vue-resizable v-if="active"
                 :active="directions"
                 :height="`${modelValue}px`"
                 :min-height="minHeight"
                 class="full-width"
                 @resize:end="setHeight">
    <slot />
  </vue-resizable>
  <slot v-else />
</template>

<script setup>
  import VueResizable from 'vue-resizable'

  defineProps({
    modelValue: {
      type: Number,
      default: 500
    },
    minHeight: {
      type: Number,
      default: 100
    },
    directions: {
      type: Array,
      default: () => (['b'])
    },
    active: {
      type: Boolean,
      default: true
    }
  })

  const emit = defineEmits(['update:modelValue'])
  const setHeight = ({ height }) => (emit('update:modelValue', height))
</script>
