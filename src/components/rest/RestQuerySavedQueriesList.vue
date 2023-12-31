<template>
  <rest-query-list v-if="open"
                   heading="Saved Queries"
                   :pagination-options="{}"
                   :data="savedQueries"
                   :columns="columns"
                   :searchable-columns="['name', 'path', 'method']"
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
      <td>
        {{ row.name }}
      </td>
      <td class="small-wrap">
        <q-btn-group>
          <q-btn icon="edit" color="dark-grey" dense>
            <q-popup-edit v-slot="scope" v-model="row.name" auto-save anchor="center right"
                          @save="(v:string) => (renameSavedQuery(v, row))">
              <q-input v-model="scope.value" dense autofocu outlined @keydown.enter="scope.set" />
            </q-popup-edit>
          </q-btn>
          <q-btn icon="delete" color="dark-grey" dense @click.stop="removeSavedQuery(row.id)" />
        </q-btn-group>
      </td>
    </template>
  </rest-query-list>
</template>

<script setup lang="ts">
  import RestQueryList from './RestQueryList.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { useIdbStore } from '../../db/Idb.ts'
  import { ref, toRaw } from 'vue'
  import { IdbRestQuerySavedQuery } from '../../db/types.ts'

  defineProps<{ open: boolean }>()
  const emit = defineEmits(['useRequest', 'useRequestNewTab'])
  const t = useTranslation()

  const { restQuerySavedQueries } = useIdbStore()
  const savedQueries = ref([] as IdbRestQuerySavedQuery[])
  restQuerySavedQueries.getAll().then(saved => (savedQueries.value = saved))

  const removeSavedQuery = (id: number) => (restQuerySavedQueries.remove(id))
  const renameSavedQuery = (name: string, row: IdbRestQuerySavedQuery) => {
    const obj = Object.assign({}, toRaw(row), { name })
    restQuerySavedQueries.update(obj)
  }

  const columns = [
    { label: t('query.rest_query_history.table.headers.query'), field: 'query', name: 'query', align: 'left' },
    { label: 'Name', field: 'name', name: 'name', align: 'left', sortable: true },
    { label: '' },
  ]
</script>