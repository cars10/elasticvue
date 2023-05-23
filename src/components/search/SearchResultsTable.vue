<template>
  <div class="flex justify-end q-pa-md">
    <div class="flex">
      <filter-input v-model="filter" />

      <q-btn icon="settings" round flat>
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense class="q-pb-sm">
            <q-item style="padding-left: 6px">
              <q-checkbox v-model="searchStore.stickyTableHeader" size="32px"
                          :label="$t('indices.indices_table.sticky_table_header.label')" />
            </q-item>

            <q-separator />

            <q-item class="q-mt-sm">
              <q-item-label style="flex-grow: 1">
                <div class="flex justify-between items-center" style="flex-grow: 1">
                  {{ $t('search.results_table.settings.columns') }}

                  <q-btn :label="$t('shared.table_settings.reset')" flat size="sm" class="q-px-xs"
                         @click="resetColumns" />
                </div>
              </q-item-label>
            </q-item>

            <q-item v-for="col in columns" :key="col.name" style="padding-left: 8px" dense>
              <q-checkbox v-model="searchStore.visibleColumns" :val="col.name" :label="col.label" size="32px"
                          style="flex-grow: 1" />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{'table--sticky-header': searchStore.stickyTableHeader}">
    <resizable-container v-model="resizeStore.searchTable" :active="searchStore.stickyTableHeader">
      <q-table v-model:pagination="searchStore.pagination"
               class="table-mono"
               flat
               dense
               :virtual-scroll="searchStore.stickyTableHeader"
               :virtual-scroll-item-size="14"
               :columns="columns"
               :rows="hits"
               :rows-per-page-options="rowsPerPage"
               :visible-columns="searchStore.visibleColumns"
               @request="onRequest">
        <template #body="{row, cols}">
          <search-result :columns="cols" :doc="row" />
        </template>
      </q-table>
    </resizable-container>
  </div>

  <div class="q-pa-md text-right">
    <download-button color="dark-grey"
                     :disable="hits.length === 0"
                     size="12px"
                     download="search.json"
                     :label="$t('search.results_table.download_as_json')"
                     :generate-download-data="generateDownloadData" />
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
  import DownloadButton from '../shared/DownloadButton.vue'

  const props = defineProps<{ results: object }>()
  const emit = defineEmits(['request'])
  const hits = ref([])

  const resizeStore = useResizeStore()
  const searchStore = useSearchStore()
  const filter = ref('')
  const columns = ref([])

  const { callElasticsearch } = useElasticsearchAdapter()

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

    const previousColumns = columns.value.map(c => c.name).concat(searchStore.visibleColumns)
    columns.value = results.uniqueColumns.map(field => {
      const filterableCol = sortableField(field, allProperties[field])

      return { label: field, field, name: filterableCol, sortable: !!filterableCol, align: 'left' }
    })

    const newColumns = results.uniqueColumns.filter(c => !previousColumns.includes(c))
    searchStore.visibleColumns = searchStore.visibleColumns.concat(newColumns)

    hits.value = results.docs
  })

  const onRequest = a => {
    emit('request', a)
  }

  const resetColumns = () => {
    searchStore.visibleColumns = columns.value.map(c => c.name)
  }

  const generateDownloadData = () => {
    return JSON.stringify(props.results)
  }

  const rowsPerPage = computed(() => {
    if (searchStore.stickyTableHeader) {
      return [0]
    } else {
      return DEFAULT_ROWS_PER_PAGE
    }
  })
</script>
