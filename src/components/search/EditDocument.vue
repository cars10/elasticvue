<template>
  <q-dialog v-model="ownValue">
    <q-card style="width: 800px; max-width: 800px;">
      <q-card-section class="flex justify-between">
        <div class="flex">
          <h2 class="text-h6 q-my-none">
            {{ _index }} / {{ _type }} / {{ _id }}
          </h2>
          <reload-button :action="loadDocument" />
        </div>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <loader-status :request-state="requestState">
          <resizable-container v-model="resizeStore.documentEdit">
            <code-editor v-model="document" />
          </resizable-container>
        </loader-status>
      </q-card-section>

      <q-card-section>
        <q-btn :label="t('search.edit_document.update.text')"
               :loading="loading"
               color="positive"
               type="submit"
               class="q-mr-md"
               @click="updateDocument" />
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

  const {
    document,
    ownValue,
    loadDocument,
    requestState,
    loading,
    updateDocument
  } = useEditDocument(props, emit)
</script>