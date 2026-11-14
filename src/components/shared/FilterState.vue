<template>
  <div v-if="filter" class="flex items-center">
    <q-chip color="primary-dark" text-color="white" clickable removable @click="filter = ''" @remove="filter = ''">
      <span class="q-pr-sm">{{ t('shared.filter_state.filter', { filter }) }}</span>
    </q-chip>

    <div class="q-mx-sm font-14">
      {{ t('shared.filter_state.matches', { filtered: filteredResultsCount, total: resultsCount }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'

defineProps<{ resultsCount: number; filteredResultsCount: number }>()
const filter = defineModel<string>({ required: true })
const t = useTranslation()
</script>
