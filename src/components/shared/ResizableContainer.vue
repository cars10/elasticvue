<template>
  <vue-resizable v-if="active"
                 :active="directions"
                 :height="`${modelValue}px`"
                 :min-height="minHeight"
                 class="full-width"
                 @resize:end="setHeight">
    <div class="q-pb-md full-height">
      <slot />
    </div>
  </vue-resizable>
  <slot v-else />
</template>

<script setup lang="ts">
  // @ts-ignore
  import VueResizable from 'vue-resizable'

  withDefaults(defineProps<{
    modelValue: number,
    minHeight: number,
    directions: string[],
    active: boolean
  }>(), {
    modelValue: 500,
    minHeight: 100,
    directions: () => (['b']),
    active: true
  })

  const emit = defineEmits(['update:modelValue'])
  const setHeight = ({ height }: { height: number }) => {
    emit('update:modelValue', height)
    window?.dispatchEvent(new Event('resize'))
  }
</script>
