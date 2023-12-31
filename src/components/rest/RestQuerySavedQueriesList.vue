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
  import { useRestQuerySavedQueriesList } from '../../composables/components/rest/RestQuerySavedQueriesList.ts'
  import { IdbRestQuerySavedQuery } from '../../db/types.ts'

  defineProps<{ savedQueries: IdbRestQuerySavedQuery[], open: boolean }>()
  const emit = defineEmits(['reloadSavedQueries', 'useRequest', 'useRequestNewTab'])

  const { removeSavedQuery, renameSavedQuery, columns } = useRestQuerySavedQueriesList(emit)
</script>