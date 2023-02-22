<template>
  <div class="flex justify-end q-pa-md">
    <div class="flex">
      <q-input v-model="filter" :label="t('defaults.filter.label')" dense @keyup.esc="filter = ''">
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <q-table v-if="queryHistory.elements.value"
           flat
           dense
           row-key="index"
           :columns="columns"
           :rows="filteredHistory"
           :pagination="{sortBy: 'date'}"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
    <template #body="{row}">
      <tr>
        <td>{{ row.method }} {{ row.path }}</td>
        <td>{{ row.date.toLocaleString() }}</td>
      </tr>
    </template>
  </q-table>
</template>

<script setup>
  import { useTranslation } from '../../composables/i18n'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { computed, ref } from 'vue'
  import { useIdb } from '../../composables/Idb'

  const { queryHistory } = useIdb()


  const t = useTranslation()
  const filter = ref('')
  const filteredHistory = computed(() => {
    const search = filter.value.trim()
    if (search.length === 0) return queryHistory?.elements?.value || []

    return queryHistory.elements.value.filter(element => {
      return `${element.method} ${element.path}`.toLowerCase().includes(search)
    })
  })

  const columns = [
    { label: t('query.rest_query_history.table.headers.query'), field: 'query', name: 'query', align: 'left' },
    {
      label: t('query.rest_query_history.table.headers.date'), field: 'date', name: 'date', align: 'left',
      sortOrder: 'da', sortable: true
    }
  ]
</script>