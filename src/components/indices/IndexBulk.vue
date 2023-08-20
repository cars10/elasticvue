<template>
  <q-btn-dropdown ref="menu"
                  :label="t('defaults.bulk')"
                  color="positive"
                  menu-anchor="top left"
                  menu-self="bottom left">
    <q-list padding dense>
      <row-menu-action v-if="connectionStore.activeCluster && parseInt(connectionStore.activeCluster.majorVersion) > 1"
                       method="indexForcemerge"
                       :method-params="{index: selectedIndices.join(',')}"
                       :text="t('indices.index_row.options.forcemerge.text', selectedIndices.length)"
                       icon="call_merge"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexRefresh"
                       :method-params="{index: selectedIndices.join(',')}"
                       :text="t('indices.index_row.options.refresh.text', selectedIndices.length)"
                       icon="refresh"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexFlush"
                       :method-params="{index: selectedIndices.join(',')}"
                       :text="t('indices.index_row.options.flush.text', selectedIndices.length)"
                       icon="archive"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexClearCache"
                       :method-params="{index: selectedIndices.join(',')}"
                       :text="t('indices.index_row.options.clear_cache.text', selectedIndices.length)"
                       icon="clear_all"
                       @done="emitAndCloseMenu('reload')" />

      <q-separator />

      <row-menu-action method="indexClose"
                       :disabled="selectedIndices.length === 0"
                       :method-params="{index: selectedIndices.join(',')}"
                       :text="t('indices.index_row.options.close.text', selectedIndices.length)"
                       icon="lock"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexOpen"
                       :disabled="selectedIndices.length === 0"
                       :method-params="{index: selectedIndices.join(',')}"
                       :text="t('indices.index_row.options.open.text', selectedIndices.length)"
                       icon="lock_open"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexDelete"
                       :disabled="selectedIndices.length === 0"
                       :confirm="t('indices.index_row.options.delete.confirm', {index: selectedIndices.join(',')})"
                       :method-params="{index: selectedIndices.join(',')}"
                       :text="t('indices.index_row.options.delete.text', selectedIndices.length)"
                       icon="delete"
                       @done="emitAndCloseMenu('indicesDeleted')" />
    </q-list>
  </q-btn-dropdown>

  <div v-if="selectedIndices.length > 0" class="inline-block q-ml-md"
       :class="{'text-grey': selectedIndices.length === 0}">
    <small>{{ selectedIndices.length }} / {{ filteredItemsCount }} selected</small>
    <small v-if="filteredItemsCount !== totalItemsCount"> ({{ totalItemsCount }} total)</small>
  </div>
</template>

<script setup lang="ts">
  import { Ref, ref } from 'vue'
  import { QMenu } from 'quasar'
  import { useTranslation } from '../../composables/i18n'
  import RowMenuAction from './RowMenuAction.vue'
  import { useConnectionStore } from '../../store/connection.ts'

  const t = useTranslation()
  const connectionStore = useConnectionStore()

  defineProps<{ selectedIndices: string[], totalItemsCount: number, filteredItemsCount: number }>()
  const emit = defineEmits(['reload', 'indicesDeleted'])

  const menu: Ref<QMenu | null> = ref(null)
  const emitAndCloseMenu = (event: 'reload' | 'indicesDeleted') => {
    emit(event)
    menu.value?.hide()
  }
</script>