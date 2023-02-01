<template>
  <div class="d-inline-block reload-button">
    <div class="flex items-center">
      <q-btn :title="t('shared.reload_button.reload')"
             class="mr-0"
             round
             flat
             dense
             size="13px"
             icon="cached"
             @click="action" />
      <timer-select :action="action" />
    </div>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n/dist/vue-i18n.cjs'
  import TimerSelect from './TimerSelect.vue'

  const { t } = useI18n()

  defineProps({
    action: {
      type: Function,
      default: () => {
      }
    }
  })
</script>
