<template>
  <div class="bordered code-editor">
    <div ref="editor" style="height: 100%; width: 100%" />

    <div class="code-editor__actions">
      <div class="d-inline-block">
        <copy-button round flat dense :custom-handler="copyContent" />
      </div>

      <div class="d-inline-block">
        <q-btn icon="settings" round flat dense>
          <q-menu style="white-space: nowrap" class="q-pa-sm q-pr-md" anchor="bottom right" self="top end">
            <q-checkbox v-model="codeEditorStore.useSpaces"
                        :label="$t('shared.code_editor.actions.whitespace.label')"
                        :title="$t('shared.code_editor.actions.whitespace.title')" />
            <br>
            <q-checkbox v-model="codeEditorStore.wrapLines"
                        :label="$t('shared.code_editor.actions.wrap_lines.label')"
                        :title="$t('shared.code_editor.actions.wrap_lines.title')" />
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, toRef } from 'vue'
  import { useCodeEditor } from '../../composables/UseCodeEditor'
  import { useCodeEditorStore } from '../../store/code_editor'
  import CopyButton from './CopyButton.vue'

  const props = defineProps({
    value: {
      type: null, // any
      default: ''
    },
    focus: {
      type: Boolean,
      default: true
    }
  })

  const codeEditorStore = useCodeEditorStore()

  const editor = ref(null)
  const { copyContent } = useCodeEditor(editor, {
    readOnly: true,
    focus: props.focus,
    initialValue: toRef(props, 'value')
  })
</script>
