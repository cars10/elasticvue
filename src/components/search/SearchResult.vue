<template>
  <tr
    class="clickable"
    :title="t('search.search_result.edit_hint')"
    data-testid="search-result"
    @click="onClick"
    @dblclick="onDblclick"
  >
    <td>
      <slot name="checkbox" />
    </td>
    <td v-for="column in columns" :key="column" :class="{ 'text-muted': column === SOURCE_COLUMN }">
      {{ cellValue(column) }}
    </td>
    <td class="text-right">
      <edit-document
        v-model="edit"
        :_id="hit._id"
        :_index="hit._index"
        :_type="hit._type || '_doc'"
        :_routing="hit._routing"
        @reload="emit('reload')"
      />
      <div v-intersection="onIntersection" class="inline-block" style="min-width: 80px">
        <template v-if="buttonsVisible">
          <q-btn flat round dense icon="edit" data-testid="search-result-edit" @click="edit = true" />
          <q-btn flat round dense icon="delete" data-testid="search-result-delete" @click="deleteDocument" />
        </template>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import EditDocument from './EditDocument.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { SOURCE_COLUMN } from '../../helpers/search/columns.ts'
import { SearchResultProps, useSearchResult } from '../../composables/components/search/SearchResult.ts'

const props = defineProps<SearchResultProps>()
const emit = defineEmits<{ reload: []; open: [] }>()

const t = useTranslation()
const { edit, cellValue, deleteDocument, buttonsVisible, onIntersection, onClick, onDblclick } = useSearchResult(props, emit)
</script>
