<template>
  <div class="bordered code-editor">
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
                     :title="$t('shared.code_editor.actions.beautify.title')"
                     color="visible-bg"
                     class="full-width"
                     @click="beautifyEditorValue">
                <q-icon dense name="auto_fix_normal" />
                {{ $t('shared.code_editor.actions.beautify.text') }}
              </q-btn>
            </q-item>

            <q-separator />

            <q-item class="q-pb-xs">
              <q-checkbox v-model="codeEditorStore.useSpaces"
                          dense
                          :label="$t('shared.code_editor.actions.whitespace.label')"
                          :title="$t('shared.code_editor.actions.whitespace.title')" />
            </q-item>
            <q-item class="q-pt-xs">
              <q-checkbox v-model="codeEditorStore.wrapLines"
                          dense
                          :label="$t('shared.code_editor.actions.wrap_lines.label')"
                          :title="$t('shared.code_editor.actions.wrap_lines.title')" />
            </q-item>

            <q-separator />

            <q-item>
              <a href="https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts"
                 rel="nofollow"
                 target="_blank">
                {{ $t('shared.code_editor.actions.keyboard_shortcuts.text') }}
              </a>
            </q-item>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, toRef } from 'vue'
  import { useCodeEditor } from '../../composables/CodeEditor'
  import { useCodeEditorStore } from '../../store/code_editor'
  import CopyButton from './CopyButton.vue'

  const props = defineProps({
    modelValue: {
      type: String, // any
      default: ''
    },
    commands: {
      type: Object,
      default: () => {
      }
    }
  })
  const emit = defineEmits(['update:modelValue'])

  const codeEditorStore = useCodeEditorStore()

  const editor = ref(null)
  const { copyContent, beautifyEditorValue } = useCodeEditor(editor, {
    readOnly: false,
    focus: false,
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
