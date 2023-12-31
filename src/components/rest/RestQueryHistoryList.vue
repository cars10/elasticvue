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
  import { IdbRestQueryHistory } from '../../db/types.ts'
  import { useRestQueryHistoryList } from '../../composables/components/rest/RestQueryHistoryList.ts'

  defineProps<{ history: IdbRestQueryHistory[], open: boolean }>()
  const emit = defineEmits<{
    useRequest: [request: RestQueryRequestLike],
    useRequestNewTab: [request: RestQueryRequestLike],
    reloadHistory: [],
    reloadSavedQueries: []
  }>()

  const { saveHistory, removeHistory, columns } = useRestQueryHistoryList(emit)
</script>