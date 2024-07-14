<template>
  <div class="row">
    <div class="col q-pr-md">
      <div class="flex justify-between q-pb-md">
        <h4 class="text-h5 q-mb-none q-mt-sm">{{ heading }}</h4>

        <filter-input v-model="filter" />
      </div>

      <q-table flat
               dense
               class="table-mono table-hide-overflow"
               row-key="id"
               :columns="columns"
               :rows="filteredData"
               :pagination="paginationOptions"
               :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
        <template #body="{row}">
          <tr :class="{selected: selectedRow?.id === row.id, clickable: true}"
              @click="selectedRow = row"
              @dblclick="selectedRow ? emit('useRequest', selectedRow) : void(0)">
            <slot :row="row" />
          </tr>
        </template>
      </q-table>
    </div>

    <div class="col">
      <div v-if="selectedRow" class="flex column full-height q-pl-md">
        <h5 class="font-mono text-subtitle1 q-mt-none q-mb-sm">
          <strong :class="`http-${selectedRow.method}`">{{ selectedRow.method }}</strong>
          {{ selectedRow.path }}
        </h5>

        <div class="col-grow q-mb-md">
          <code-editor v-model="selectedRow.body" />
        </div>

        <div>
          <q-btn :label="t('query.rest_query_history.body_preview.use')"
                 color="primary-dark"
                 class="q-mr-sm"
                 @click="emit('useRequest', selectedRow)" />
          <q-btn :label="t('query.rest_query_history.body_preview.open_new_tab')"
                 color="dark-grey"
                 @click="emit('useRequestNewTab', selectedRow)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends RestQueryRequestLike">
  import { computed, Ref, ref, defineAsyncComponent } from 'vue'
  import FilterInput from '../shared/FilterInput.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useTranslation } from '../../composables/i18n'
  import { filterItems } from '../../helpers/filters.ts'

  const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))

  type PaginationOptions = {
    sortBy?: string,
    descending?: boolean
  }

  const t = useTranslation()
  const props = defineProps<{
    data: T[],
    columns: any[],
    heading: string,
    paginationOptions: PaginationOptions,
    searchableColumns: string[]
  }>()
  const emit = defineEmits<{
    useRequest: [request: RestQueryRequestLike],
    useRequestNewTab: [request: RestQueryRequestLike]
  }>()

  const selectedRow: Ref<T | null> = ref(null)

  const filter = ref('')
  const filteredData = computed(() => {
    const search = filter.value.trim().toLowerCase()
    if (search.length === 0) return props.data || []

    return filterItems<T>(props.data, search, props.searchableColumns)
  })
</script>