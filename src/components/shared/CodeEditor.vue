<template>
  <div class="border-2 code-editor">
    <div ref="editor" class="full-width full-height" />

    <div class="code-editor__actions">
      <div class="inline-block">
        <copy-button round flat dense :custom-handler="copyContent" />
      </div>

      <div class="inline-block">
        <q-btn icon="settings" round flat dense>
          <q-menu style="white-space: nowrap" dense anchor="bottom right" self="top end">
            <q-item>
              <q-btn :disable="!validJson"
                     :title="t('shared.code_editor.actions.beautify.title')"
                     color="dark-grey"
                     class="full-width"
                     @click="beautifyEditorValue">
                <q-icon dense name="auto_fix_normal" />
                {{ t('shared.code_editor.actions.beautify.text') }}
              </q-btn>
            </q-item>

            <q-separator />

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

            <q-separator />

            <q-item>
              <a href="https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts"
                 rel="nofollow"
                 target="_blank">
                {{ t('shared.code_editor.actions.keyboard_shortcuts.text') }}
              </a>
            </q-item>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, Ref, ref, toRef } from 'vue'
  import { useCodeEditor } from '../../composables/CodeEditor'
  import { useCodeEditorStore } from '../../store/code_editor'
  import CopyButton from './CopyButton.vue'
  import { useTranslation } from '../../composables/i18n'

  const props = defineProps<{ modelValue: string, commands?: AceAjax.EditorCommand[] }>()
  const emit = defineEmits(['update:modelValue'])
  const t = useTranslation()
  const codeEditorStore = useCodeEditorStore()

  const editor: Ref<HTMLElement | null> = ref(null)
  const { copyContent, beautifyEditorValue } = useCodeEditor(editor, {
    readOnly: false,
    initialValue: toRef(props, 'modelValue'),
    commands: props.commands,
    emit
  })

  const validJson = computed(() => {
    if (props.modelValue === '') return true
    try {
      JSON.parse(props.modelValue)
      return true
    } catch (error) {
      return false
    }
  })
</script>
