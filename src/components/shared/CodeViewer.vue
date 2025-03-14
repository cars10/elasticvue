<template>
  <div class="border-2 code-editor">
    <div ref="editor" class="full-width full-height" />

    <div class="code-editor__actions">
      <div class="inline-block">
        <q-btn round flat dense icon="unfold_more" :title="t('shared.code_editor.actions.expand_all.title')"
               @click="expandAll" />
        <q-btn round flat dense icon="unfold_less" :title="t('shared.code_editor.actions.collapse_all.title')"
               @click="collapseAll" />
        <copy-button round flat dense :custom-handler="copyContent" />
      </div>

      <div class="inline-block">
        <q-btn icon="settings" round flat dense>
          <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
            <q-item dense class="q-py-sm">
              <q-checkbox v-model="codeEditorStore.wrapLines" size="32px"
                          dense
                          :label="t('shared.code_editor.actions.wrap_lines.label')"
                          :title="t('shared.code_editor.actions.wrap_lines.title')" />
            </q-item>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, toRef, Ref } from 'vue'
  import { useCodeEditor } from '../../composables/CodeEditor'
  import { useCodeEditorStore } from '../../store/codeEditor.ts'
  import CopyButton from './CopyButton.vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const props = defineProps<{ value: string }>()

  const codeEditorStore = useCodeEditorStore()

  const editor: Ref<HTMLElement | null> = ref(null)
  const { copyContent, collapseAll, expandAll } = useCodeEditor(editor, { initialValue: toRef(props, 'value') })
</script>
