<template>
  <tr class="clickable" data-testid="search-result" @click="onClick">
    <td>
      <slot name="checkbox" />
    </td>
    <td v-for="column in columns" :key="column" :class="{ 'text-muted': column === SOURCE_COLUMN }">
      {{ cellValue(column) }}
    </td>
    <td class="text-right">
      <div v-intersection="onIntersection" class="inline-block" style="min-width: 40px">
        <q-btn v-if="buttonsVisible" flat round dense icon="delete" data-testid="search-result-delete" @click="deleteDocument" />
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { SOURCE_COLUMN } from '../../helpers/search/columns.ts'
import { SearchResultProps, useSearchResult } from '../../composables/components/search/SearchResult.ts'

const props = defineProps<SearchResultProps>()
const emit = defineEmits<{ reload: []; open: [] }>()

const { cellValue, deleteDocument, buttonsVisible, onIntersection, onClick } = useSearchResult(props, emit)
</script>
