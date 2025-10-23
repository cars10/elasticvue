<template>
  <tr class="clickable" title="Double click to edit" @dblclick="edit = true" @contextmenu="handleRowContextMenu">
    <td>
      <slot name="checkbox" />
    </td>
    <td v-for="{field: column} in resultColumns" :key="column" @contextmenu="!hasMultipleSelections && handleCellContextMenu($event, column)">
      <template v-if="column === '_type'">{{ doc[column] }}</template>
      <template v-else>{{ renderValue(doc, column) }}</template>
    </td>
    <td>
      <edit-document
        v-model="edit"
        :_id="doc._id"
        :_index="doc._index"
        :_type="doc._type"
        :_routing="doc._routing"
        @reload="emit('reload')"
      />
      <div v-intersection="onIntersection" class="inline-block" style="min-width: 134px">
        <q-btn-group v-if="buttonsVisible">
          <q-btn icon="edit" color="dark-grey" @click="edit = true" />
          <q-btn icon="delete" color="dark-grey" @click="deleteDocument" />
        </q-btn-group>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import EditDocument from './EditDocument.vue'
import { useSearchResult } from '../../composables/components/search/SearchResult.ts'
import type { SearchResultProps } from '../../composables/components/search/SearchResult.ts'

  const props = defineProps<SearchResultProps & {
    hasMultipleSelections?: boolean
  }>()
  const emit = defineEmits<{ 
    reload: []
    'row-context-menu': [event: MouseEvent, rowData: any]
    'cell-context-menu': [event: MouseEvent, rowData: any, cellContent: string, field:string]
  }>()

  const {
    resultColumns,
    edit,
    deleteDocument,
    renderValue,
    buttonsVisible,
    onIntersection
  } = useSearchResult(props, emit)

  const handleRowContextMenu = (event: MouseEvent) => {
    emit('row-context-menu', event, props.doc)
  }

  const handleCellContextMenu = (event: MouseEvent, column: string) => {
    const cellValue = column === '_type' ? props.doc[column] : renderValue(props.doc, column)
    const cellContent = String(cellValue || '')
    emit('cell-context-menu', event, props.doc, cellContent, column)
  }
</script>
