<template>
  <div class="border-2 code-editor">
    <div ref="editor" class="full-width full-height" />

    <div class="code-editor__actions">
      <div class="inline-block">
        <copy-button round flat dense :custom-handler="copyContent" />
      </div>

      <div class="inline-block">
        <q-btn icon="settings" round flat dense>
          <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
            <q-item dense class="q-pt-sm">
              <q-checkbox v-model="codeEditorStore.useSpaces" size="32px"
                          dense
                          :label="t('shared.code_editor.actions.whitespace.label')"
                          :title="t('shared.code_editor.actions.whitespace.title')" />
            </q-item>
            <q-item dense class="q-pb-sm">
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
  import { ref, toRef } from 'vue'
  import { useCodeEditor } from '../../composables/CodeEditor'
  import { useCodeEditorStore } from '../../store/code_editor'
  import CopyButton from './CopyButton.vue'
  import { useTranslation } from '../../composables/i18n'
  import { Ref } from 'vue/dist/vue'

  const t = useTranslation()
  const props = defineProps<{value: string}>()

  const codeEditorStore = useCodeEditorStore()

  const editor: Ref<HTMLElement | null> = ref(null)
  const { copyContent } = useCodeEditor(editor, {
    readOnly: true,
    initialValue: toRef(props, 'value')
  })
</script>
