<template>
  <div class="flex items-center no-wrap">
    <svg v-if="index" height="14" width="14" class="q-mr-xs">
      <circle :class="`health--${index.health}`" cx="7" cy="7" r="5" />
    </svg>
    <span class="text-weight-medium" :class="{ 'text-underline': active }">{{ name }}</span>
  </div>
  <div v-if="index" class="text-muted font-13 text-weight-regular" :title="t('shards.shards_table.pri_rep', index)">
    {{ t('shards.shards_table.index_shards', index) }}
  </div>
  <div v-else class="text-muted font-13 text-weight-regular">
    {{ t('shards.shards_table.node_shards', { count }, count ?? 0) }}
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'
import type { EsShardIndex } from '../../helpers/shards.ts'

defineProps<{ name: string; index?: EsShardIndex; count?: number; active?: boolean }>()
const t = useTranslation()
</script>
