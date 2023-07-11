<template>
  <p class="text-muted">
    {{ t('shared.authorization_header_hint') }}
  </p>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n.ts'

  const t = useTranslation()
</script>