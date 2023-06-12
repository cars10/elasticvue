<template>
  <q-btn-dropdown ref="menu"
                  :label="t('defaults.bulk')"
                  :disable="selected.length === 0"
                  color="positive"
                  menu-anchor="top left"
                  menu-self="bottom left">
    <q-list padding dense>
      <row-menu-action method="docsBulkDelete"
                       :confirm="t('search.search_results_bulk.delete.confirm', selected.length)"
                       :method-params="selected"
                       :text="t('search.search_results_bulk.delete.text', selected.length)"
                       :growl="t('search.search_results_bulk.delete.growl', selected.length)"
                       icon="delete"
                       @done="emitAndCloseMenu" />
    </q-list>
  </q-btn-dropdown>

  <div class="inline-block q-ml-md" :class="{'text-grey': selected.length === 0}">
    <small>{{ selected.length }} selected</small>
  </div>
</template>

<script setup lang="ts">
  import { Ref, ref } from 'vue'
  import { QMenu } from 'quasar'
  import { useTranslation } from '../../composables/i18n'
  import RowMenuAction from '../indices/RowMenuAction.vue'

  const t = useTranslation()

  defineProps<{ selected: string[], totalItemsCount: number, filteredItemsCount: number }>()

  const emit = defineEmits(['reload'])

  const menu: Ref<QMenu | null> = ref(null)
  const emitAndCloseMenu = () => {
    menu.value?.hide()
    emit('reload')
  }
</script>