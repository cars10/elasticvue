<template>
  <q-dialog v-model="ownValue" transition-duration="100" @show="triggerResize">
    <q-card style="width: 1000px; max-width: 1000px;">
      <q-card-section class="flex justify-between">
        <div class="flex">
          <h2 class="text-h6 q-my-none">
            <template v-if="isNew">{{ t('search.edit_document.new_document') }}</template>
            <template v-else>{{ _index }} / {{ _type }} / {{ _id }}</template>
          </h2>
          <reload-button v-if="!isNew" :action="loadDocument" />
        </div>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <loader-status :request-state="requestState">
          <q-select v-if="isNew" v-model="selectedIndex" :options="availableIndices" label="Index" outlined
                    class="q-mb-md" />
          <q-list v-if="!isNew && validDocumentMeta" class="flex justify-between q-mb-md">
            <q-item v-for="(value, key) of validDocumentMeta" :key="`${key}_${value}`" class="q-px-none q-mx-sm">
              <q-item-section>
                <q-item-label>{{ key }}</q-item-label>
              </q-item-section>
              <q-item-section side style="padding-left: 8px;">
                <q-item-label>{{ value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <resizable-container v-model="resizeStore.documentEdit" dense>
            <code-editor v-model="document" />
          </resizable-container>
        </loader-status>
      </q-card-section>

      <q-card-section>
        <q-btn :label="t(isNew ? 'search.edit_document.create.text' : 'search.edit_document.update.text')"
               :loading="loading"
               color="positive"
               type="submit"
               class="q-mr-md"
               @click="saveDocument" />
        <q-btn id="close" v-close-popup flat :label="t('defaults.close')" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { useResizeStore } from '../../store/resize.js'
  import ReloadButton from '../shared/ReloadButton.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { EditDocumentProps, useEditDocument } from '../../composables/components/search/EditDocument.ts'

  const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))

  const props = defineProps<EditDocumentProps>()
  const emit = defineEmits(['reload', 'update:modelValue'])
  const resizeStore = useResizeStore()
  const t = useTranslation()

  const triggerResize = () => (window.dispatchEvent(new Event('resize')))

  const {
    document,
    validDocumentMeta,
    ownValue,
    loadDocument,
    requestState,
    loading,
    saveDocument,
    isNew,
    availableIndices,
    selectedIndex
  } = useEditDocument(props, emit)
</script>