<template>
  <q-menu
    v-model="show"
    :target="target || undefined"
    context-menu
    :offset="[0, 5]"
    transition-show="scale"
    transition-hide="scale"
    @before-show="onBeforeShow"
  >
      <q-list dense style="min-width: 200px">
      <!-- Mode sélection multiple -->
      <template v-if="isMultipleSelection && selectedRows && selectedRows.length > 1">
        <q-item clickable v-close-popup @click="copySelectedRowsJson">
          <q-item-section avatar>
            <q-icon name="content_copy" />
          </q-item-section>
          <q-item-section>
            {{ t('search.context_menu.copy_selected_rows_json', { count: selectedRows.length }) }}
          </q-item-section>
        </q-item>
      </template>

      <!-- Mode sélection simple -->
      <template v-else>
         <q-item clickable v-close-popup @click="editRowJson">
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>
            {{ t('search.context_menu.edit_row_json') }}
          </q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="copyRowJson">
          <q-item-section avatar>
            <q-icon name="content_copy" />
          </q-item-section>
          <q-item-section>
            {{ t('search.context_menu.copy_row_json') }}
          </q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="copyCellContent" v-if="cellContent">
          <q-item-section avatar>
            <q-icon name="content_copy" />
          </q-item-section>
          <q-item-section>
            {{ t('search.context_menu.copy_cell_content') }}
          </q-item-section>
        </q-item>
        
        <q-separator v-if="cellContent" />

        <q-item clickable v-close-popup @click="copyRowId">
          <q-item-section avatar>
            <q-icon name="fingerprint" />
          </q-item-section>
          <q-item-section>
            {{ t('search.context_menu.copy_row_id') }}
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { useSnackbarStore } from '../../store/snackbar.ts'
  import { stringifyJson } from '../../helpers/json/stringify.ts'

  const props = defineProps<{
    modelValue: boolean
    target: string | HTMLElement | null
    rowData: any
    cellContent?: string
    selectedRows?: any[]
    isMultipleSelection?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'edit-document': [rowData: any]
  }>()

  const t = useTranslation()
  const snackbarStore = useSnackbarStore()

  const show = ref(false)

  watch(() => props.modelValue, (newValue) => {
    show.value = newValue
  })

  watch(show, (newValue) => {
    emit('update:modelValue', newValue)
  })

  const onBeforeShow = () => {
    // Préparer les données si nécessaire
  }

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text)
      snackbarStore.show({
        title: 'Succès',
        body: successMessage,
        color: 'positive'
      })
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
      snackbarStore.show({
        title: 'Erreur',
        body: 'Erreur lors de la copie dans le presse-papier',
        color: 'negative'
      })
    }
  }

  const copyRowJson = async () => {
    if (props.rowData) {
      const jsonString = stringifyJson(props.rowData)
      await copyToClipboard(jsonString, t('search.context_menu.row_copied'))
    }
  }
  
  const editRowJson = () => {
    if (props.rowData) {
      emit('edit-document', props.rowData)
    }
  }

  const copyCellContent = async () => {
    if (props.cellContent) {
      await copyToClipboard(props.cellContent, t('search.context_menu.cell_copied'))
    }
  }

  const copyRowId = async () => {
    if (props.rowData?._id) {
      await copyToClipboard(props.rowData._id, t('search.context_menu.id_copied'))
    }
  }

  const copySelectedRowsJson = async () => {
    if (props.selectedRows && props.selectedRows.length > 0) {
      const jsonString = stringifyJson(props.selectedRows)
      await copyToClipboard(jsonString, t('search.context_menu.selected_rows_copied', { count: props.selectedRows.length }))
    }
  }
</script>
