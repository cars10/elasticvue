<template>
  <q-btn-dropdown ref="menu"
                  :label="t('defaults.bulk')"
                  color="positive"
                  menu-anchor="top left"
                  menu-self="bottom left">
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

      <q-separator />

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

      <q-item clickable :disable="selectedIndices.length === 0" @click="startClear">
        <q-item-section side>
          <q-icon name="delete_sweep" size="xs" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ t('indices.index_row.options.clear.text', selectedIndices.length) }}</q-item-label>
        </q-item-section>
      </q-item>

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

  <!-- Dialog de progression -->
  <q-dialog v-model="progressDialogVisible" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ t('indices.index_clear.progress.title') }}</div>
        <div class="text-subtitle2">{{ t('indices.index_clear.progress.clearing', { index: selectedIndices.join(', ') }) }}</div>
      </q-card-section>

      <q-card-section>
        <div class="text-body2 q-mb-sm">{{ progressStatus }}</div>
        <q-linear-progress
            :value="progressPercentage / 100"
            animation-speed="1000"
            class="q-mb-sm"
            rounded
            size="12px" />
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
               @click="closeProgressDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { computed, Ref, ref } from 'vue'
  import { QMenu, useQuasar } from 'quasar'
  import { useTranslation } from '../../composables/i18n'
  import RowMenuAction from './RowMenuAction.vue'
  import { clusterVersionGt } from '../../helpers/minClusterVersion.ts'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch.ts'
  import { askConfirm } from '../../helpers/dialogs.ts'

  const t = useTranslation()
  const $q = useQuasar()

  const props = defineProps<{ selectedIndices: string[], totalItemsCount: number, filteredItemsCount: number }>()
  const emit = defineEmits(['reload', 'indicesDeleted'])

  const menu: Ref<QMenu | null> = ref(null)
  const emitAndCloseMenu = (event: 'reload' | 'indicesDeleted') => {
    emit(event)
    menu.value?.hide()
  }

  // --- Progress Dialog ---
  const { callElasticsearch } = useElasticsearchAdapter()
  const progressDialogVisible = ref(false)
  const progressStatus = ref('')
  const progressProcessed = ref(0)
  const progressTotal = ref(0)
  const progressPercentage = computed(() => {
    if (progressTotal.value === 0) return 0
    return Math.round((progressProcessed.value / progressTotal.value) * 100)
  })

  const startClear = async () => {
    const confirmed = await askConfirm(t('indices.index_row.options.clear.confirm', { index: props.selectedIndices.join(', ') }))
    if (!confirmed) return

    progressDialogVisible.value = true
    progressStatus.value = t('indices.index_clear.progress.preparing')
    progressProcessed.value = 0
    progressTotal.value = 0

    try {
      await callElasticsearch('indexClear', {
        indices: props.selectedIndices,
        onProgress: (progress: { processed: number, total: number, percentage: number, status: string }) => {
          progressProcessed.value = progress.processed
          progressTotal.value = progress.total
          if (progress.status === 'Completed') {
            progressStatus.value = t('indices.index_clear.progress.completed')
            emitAndCloseMenu('reload')
          } else {
            progressStatus.value = t('indices.index_clear.progress.clearing_documents', {
              processed: progress.processed,
              total: progress.total
            })
          }
        }
      })
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: 'Error while clearing indices.'
      })
      closeProgressDialog()
    }
  }

  const closeProgressDialog = () => {
    progressDialogVisible.value = false
  }
</script>
