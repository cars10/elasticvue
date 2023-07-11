<template>
  <div class="flex q-mr-sm">
    <q-spinner v-if="loading" size="14px" />
    <svg v-else height="14" width="14" style="margin-bottom: 6px">
      <circle :class="`health--${status}`" cx="7" cy="9" r="5" />
    </svg>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    status: {
      type: String,
      default: 'unknown'
    },
    loading: {
      type: Boolean,
      default: false
    }
  })
</script>