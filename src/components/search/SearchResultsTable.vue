<template>
  <div class="flex justify-end q-pa-md">
    <div class="flex">
      <filter-input v-model="filter" />

      <q-btn icon="settings" round flat>
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox v-model="searchStore.stickyTableHeader"
                          :label="$t('indices.indices_table.sticky_table_header.label')" />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{'table--sticky-header': searchStore.stickyTableHeader}">
    <resizable-container v-model="resizeStore.searchTable" :active="searchStore.stickyTableHeader">
      <q-table v-model:pagination="searchStore.pagination"
               flat
               dense
               :virtual-scroll="searchStore.stickyTableHeader"
               :virtual-scroll-item-size="14"
               :columns="columns"
               :rows="hits"
               :rows-per-page-options="rowsPerPage"
               @request="onRequest">
        <template #body="{row}">
          <search-result :columns="columns" :doc="row" />
        </template>
      </q-table>
    </resizable-container>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import FilterInput from '../shared/FilterInput.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import SearchResult from './SearchResult.vue'
  import SearchResults from '../../models/SearchResults'
  import { useResizeStore } from '../../store/resize'
  import { useSearchStore } from '../../store/search'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { sortableField } from '../../helpers/search'

  const props = defineProps<{ results: object }>()
  const emit = defineEmits(['request'])
  const hits = ref([])

  const resizeStore = useResizeStore()
  const searchStore = useSearchStore()
  const filter = ref('')
  const columns = ref([])

  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  watch(() => props.results, async newValue => {
    if (newValue?.hits?.hits?.length === 0) {
      hits.value = []
      return
    }

    const results = new SearchResults(newValue?.hits?.hits)
    const indices = await callElasticsearch('indexGet', { index: results.uniqueIndices })
    const allProperties = {}

    Object.keys(indices).forEach(index => {
      const mappings = indices[index].mappings
      if (typeof mappings.properties === 'undefined') {
        // ES < 7
        const indexProperties = {}
        Object.keys(mappings).forEach(mapping => {
          Object.assign(indexProperties, mappings[mapping].properties)
        })
        Object.assign(allProperties, indexProperties)
      } else {
        // ES >= 7
        Object.assign(allProperties, mappings.properties)
      }
    })

    columns.value = results.uniqueColumns.map(field => {
      const filterableCol = sortableField(field, allProperties[field])
      let label

      if (filterableCol) {
        label = field === filterableCol ? field : `${field} (${filterableCol})`
      } else {
        label = field
      }
      return { label, field, name: field, sortable: !!filterableCol, align: 'left' }
    })

    hits.value = results.docs
  })

  const onRequest = a => {
    emit('request', a)
  }

  const rowsPerPage = computed(() => {
    if (searchStore.stickyTableHeader) {
      return [0]
    } else {
      return DEFAULT_ROWS_PER_PAGE
    }
  })
</script>
