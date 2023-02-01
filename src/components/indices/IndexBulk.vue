<template>
  <q-btn-dropdown ref="menu"
                  :label="$t('indices.index_bulk.bulk_action')"
                  :disable="selectedIndices.length === 0"
                  color="positive"
                  menu-anchor="top left"
                  menu-self="bottom left">
    <q-list padding dense>
      <index-row-menu-action method="indexForcemerge"
                             :index="selectedIndices.join(',')"
                             :text="$t('indices.index_row.options.forcemerge.text')"
                             icon="call_merge"
                             @done="remitAndCloseMenu('reload')" />
      <index-row-menu-action method="indexRefresh"
                             :index="selectedIndices.join(',')"
                             :text="$t('indices.index_row.options.refresh.text')"
                             icon="refresh"
                             @done="remitAndCloseMenu('reload')" />
      <index-row-menu-action method="indexFlush"
                             :index="selectedIndices.join(',')"
                             :text="$t('indices.index_row.options.flush.text')"
                             icon="archive"
                             @done="remitAndCloseMenu('reload')" />
      <index-row-menu-action method="indexClearCache"
                             :index="selectedIndices.join(',')"
                             :text="$t('indices.index_row.options.clear_cache.text')"
                             icon="clear_all"
                             @done="remitAndCloseMenu('reload')" />

      <q-separator />

      <index-row-menu-action method="indexClose"
                             :index="selectedIndices.join(',')"
                             :text="$t('indices.index_row.options.close.text')"
                             icon="lock"
                             @done="remitAndCloseMenu('reload')" />
      <index-row-menu-action method="indexOpen"
                             :index="selectedIndices.join(',')"
                             :text="$t('indices.index_row.options.open.text')"
                             icon="lock_open"
                             @done="remitAndCloseMenu('reload')" />
      <index-row-menu-action method="indexDelete"
                             :confirm="$t('indices.index_row.options.delete.confirm', {index: selectedIndices.join(',')})"
                             :index="selectedIndices.join(',')"
                             :text="$t('indices.index_row.options.delete.text')"
                             icon="delete"
                             @done="remitAndCloseMenu('indicesDeleted')" />
    </q-list>
  </q-btn-dropdown>

  <div class="d-inline-block q-ml-md" :class="{'text-grey': selectedIndices.length === 0}">
    <small>{{ selectedIndices.length }} / {{ filteredItemsCount }} selected</small>
    <small v-if="filteredItemsCount !== totalItemsCount"> ({{ totalItemsCount }} total)</small>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import IndexRowMenuAction from './IndexRowMenuAction.vue'

  defineProps({
    selectedIndices: {
      default: () => ([]),
      type: Array
    },
    totalItemsCount: {
      default: 0,
      type: Number
    },
    filteredItemsCount: {
      default: 0,
      type: Number
    }
  })

  const menu = ref(null)

  const emit = defineEmits(['reload', 'indicesDeleted'])

  const remitAndCloseMenu = event => {
    emit(event)
    menu.value.hide()
  }
</script>