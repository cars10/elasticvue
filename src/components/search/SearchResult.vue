<template>
  <tr>
    <td>
      <slot name="checkbox" />
    </td>
    <td v-for="{field: column} in resultColumns" :key="column">
      <template v-if="column === '_type'">{{ doc[column] }}</template>
      <template v-else>{{ renderValue(doc, column) }}</template>
    </td>
    <td>
      <div v-intersection="onIntersection" class="inline-block" style="min-width: 134px">
        <edit-document v-model="edit" :_id="doc._id" :_index="doc._index" :_type="doc._type" :_routing="doc._routing" />
        <q-btn-group v-if="buttonsVisible">
          <q-btn icon="info" color="dark-grey" @click="showDocument" />
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

  const props = defineProps<SearchResultProps>()
  const emit = defineEmits<{ reload: [] }>()

  const {
    resultColumns,
    edit,
    showDocument,
    deleteDocument,
    renderValue,
    buttonsVisible,
    onIntersection
  } = useSearchResult(props, emit)
</script>
