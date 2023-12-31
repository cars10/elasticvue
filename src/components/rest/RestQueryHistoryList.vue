<template>
  <rest-query-list v-if="open"
                   heading="History"
                   :pagination-options="{sortBy: 'date', descending: true}"
                   :data="history"
                   :columns="columns"
                   :searchable-columns="['method', 'path']"
                   @use-request="(v: RestQueryRequestLike) => emit('useRequest', v)"
                   @use-request-new-tab="(v: RestQueryRequestLike) => emit('useRequestNewTab', v)">
    <template #default="{row}">
      <td>
        <div class="q-py-xs">
          <span :class="`http-${row.method}`" class="text-bold">{{ row.method }}</span> {{ row.path }}
          <div>
            <small class="text-muted ellipsis">{{ row.body.slice(0, 100).replace(/\s/g, '') }}</small>
          </div>
        </div>
      </td>
      <td class="small-wrap">{{ row.date?.toLocaleString() }}</td>
      <td class="small-wrap">
        <q-btn-group>
          <q-btn icon="save" color="dark-grey" dense @click.stop="saveHistory(row)" />
          <q-btn icon="delete" color="dark-grey" dense @click.stop="removeHistory(row.id)" />
        </q-btn-group>
      </td>
    </template>
  </rest-query-list>
</template>

<script setup lang="ts">
  import RestQueryList from './RestQueryList.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { useIdbStore } from '../../db/Idb.ts'
  import { ref } from 'vue'
  import { IdbRestQueryHistory } from '../../db/types.ts'

  defineProps<{ open: boolean }>()
  const emit = defineEmits<{
    useRequest: [request: RestQueryRequestLike],
    useRequestNewTab: [request: RestQueryRequestLike]
  }>()

  const t = useTranslation()

  const { restQueryHistory, restQuerySavedQueries } = useIdbStore()
  const history = ref([] as IdbRestQueryHistory[])
  restQueryHistory.getAll().then(hist => (history.value = hist))

  const saveHistory = (row: IdbRestQueryHistory) => {
    const { method, path, body } = row
    restQuerySavedQueries.insert({ method, path, body })
  }
  const removeHistory = (id: number) => (restQueryHistory.remove(id))

  const columns = [
    { label: t('query.rest_query_history.table.headers.query'), field: 'query', name: 'query', align: 'left' },
    {
      label: t('query.rest_query_history.table.headers.timestamp'), field: 'date', name: 'date', align: 'left',
      sortOrder: 'da', sortable: true
    },
    { label: '' },
  ]
</script>