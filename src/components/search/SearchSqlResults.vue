<template>
  <div class="row no-wrap items-center q-px-md q-py-sm">
    <span class="text-muted font-13 tabular-nums" data-testid="search-sql-total">
      {{ t('search.sql.rows', { count: rows.length.toLocaleString() }, rows.length) }}{{ cursor ? '+' : '' }}
    </span>
  </div>
  <q-separator />

  <q-table
    v-model:pagination="pagination"
    class="table-mono table-hide-overflow"
    flat
    dense
    data-testid="search-sql-results"
    :columns="tableColumns"
    :rows="tableRows"
    :rows-per-page-options="[20, 100, 500]"
    row-key="__row"
  >
    <template #no-data>
      <div class="full-width text-center text-muted q-pa-md">{{ t('search.results_table.no_results') }}</div>
    </template>
  </q-table>

  <div v-if="cursor" class="row justify-center q-pa-md">
    <q-btn
      flat
      no-caps
      color="primary"
      icon="expand_more"
      :label="t('search.sql.load_more')"
      data-testid="search-sql-load-more"
      @click="emit('loadMore')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { compareValues, formatFieldValue } from '../../helpers/search/documentValues.ts'

const props = defineProps<{ columns: string[]; rows: unknown[][]; cursor: string | null }>()
const emit = defineEmits<{ loadMore: [] }>()
const t = useTranslation()

const pagination = ref({ page: 1, rowsPerPage: 100 })

const tableColumns = computed(() =>
  props.columns.map((name, index) => ({
    name: `${index}`,
    field: (row: unknown[]) => row[index],
    format: formatFieldValue,
    sort: compareValues,
    label: name,
    align: 'left' as const,
    sortable: true
  }))
)

const tableRows = computed(() => props.rows.map((row, index) => Object.assign([...row], { __row: index })))
</script>
