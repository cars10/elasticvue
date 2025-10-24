<template>
  <q-btn-dropdown ref="menu" :label="t('defaults.bulk')" color="positive" menu-anchor="top left" menu-self="bottom left">
    <q-list padding dense>
      <row-menu-action v-if="clusterVersionGt(1)"
                       method="indexForcemerge"
                       :method-params="{indices: selectedIndices}"
                       :text="t('indices.index_row.options.forcemerge.text', selectedIndices.length)"
                       icon="call_merge"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexRefresh"
                       :method-params="{indices: selectedIndices}"
                       :text="t('indices.index_row.options.refresh.text', selectedIndices.length)"
                       icon="refresh"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexFlush"
                       :method-params="{indices: selectedIndices}"
                       :text="t('indices.index_row.options.flush.text', selectedIndices.length)"
                       icon="archive"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexClearCache"
                       :method-params="{indices: selectedIndices}"
                       :text="t('indices.index_row.options.clear_cache.text', selectedIndices.length)"
                       icon="clear_all"
                       @done="emitAndCloseMenu('reload')" />

      <q-item :disable="selectedIndices.length === 0" clickable @click="startBulkExport">
        <q-item-section side>
          <q-icon name="file_download" size="xs"/>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ t('indices.index_bulk.export.text', selectedIndices.length) }}</q-item-label>
        </q-item-section>
      </q-item>

      <row-menu-action method="indexClose"
                       :disabled="selectedIndices.length === 0"
                       :method-params="{indices: selectedIndices}"
                       :text="t('indices.index_row.options.close.text', selectedIndices.length)"
                       icon="lock"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexOpen"
                       :disabled="selectedIndices.length === 0"
                       :method-params="{indices: selectedIndices}"
                       :text="t('indices.index_row.options.open.text', selectedIndices.length)"
                       icon="lock_open"
                       @done="emitAndCloseMenu('reload')" />
      <row-menu-action method="indexDelete"
                       :disabled="selectedIndices.length === 0"
                       :confirm="t('indices.index_row.options.delete.confirm', {index: selectedIndices})"
                       :method-params="{indices: selectedIndices}"
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

  <!-- clear progress -->
  <q-dialog v-model="progressDialogVisible" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ t('indices.index_clear.progress.title') }}</div>
        <div class="text-subtitle2">{{ t('indices.index_clear.progress.clearing', { index: selectedIndices.join(', ') }) }}
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-body2 q-mb-sm">{{ progressStatus }}</div>
        <q-linear-progress :value="progressPercentage / 100"
                           animation-speed="1000"
                           class="q-mb-sm"
                           rounded
                           size="12px"/>
        <div class="text-caption">
          {{ progressProcessed }} / {{ progressTotal }} ({{ progressPercentage }}%)
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-if="progressPercentage === 100"
               v-close-popup
               :label="t('defaults.close')"
               color="primary"
               flat
               @click="closeProgressDialog"/>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- bulk export progress -->
  <q-dialog v-model="bulkExportProgressDialogVisible" persistent>
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">{{ t('indices.index_bulk.export.progress.title') }}</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body2">
          {{ t('indices.index_bulk.export.progress.exporting', { current: bulkExportProgress.current, total: bulkExportProgress.total, index: bulkExportProgress.currentIndex }) }}
        </div>
        <q-linear-progress :value="bulkExportProgress.fileProgress / 100" class="q-mt-sm"/>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { Ref, ref } from 'vue'
  import { QMenu } from 'quasar'
  import { useTranslation } from '../../composables/i18n'
  import RowMenuAction from './RowMenuAction.vue'
  import { clusterVersionGt } from '../../helpers/minClusterVersion.ts'

  const t = useTranslation()

  defineProps<{ selectedIndices: string[], totalItemsCount: number, filteredItemsCount: number }>()
  const emit = defineEmits(['reload', 'indicesDeleted'])

  const menu: Ref<QMenu | null> = ref(null)
  const emitAndCloseMenu = (event: 'reload' | 'indicesDeleted') => {
    emit(event)
    menu.value?.hide()
  }
</script>