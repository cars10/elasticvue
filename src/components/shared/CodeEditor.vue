<template>
  <div class="bordered code-editor">
    <div ref="editor" style="height: 100%; width: 100%"/>

    <div class="code-editor__actions">
      <div class="d-inline-block">
        <copy-button :custom-handler="copyContent"
                     :title="$t('shared.code_editor.actions.copy_content.title')"
                     class="mr-1"/>
      </div>

      <div class="d-inline-block">
        <settings-dropdown>
          <div class="px-3 pb-3" style="white-space: nowrap">
            <v-btn :disabled="!valid"
                   :title="$t('shared.code_editor.actions.beautify.title')"
                   class="mb-2"
                   small
                   @click="beautifyEditorValue(useSpaces)">
              <v-icon class="mr-2" small>mdi-auto-fix</v-icon>
              {{ $t('shared.code_editor.actions.beautify.text') }}
            </v-btn>

            <v-divider/>

            <v-checkbox v-model="useSpaces"
                        :label="$t('shared.code_editor.actions.whitespace.label')"
                        :title="$t('shared.code_editor.actions.whitespace.title')"
                        class="my-1 py-0"
                        hide-details/>

            <v-checkbox v-model="wrapLines"
                        :label="$t('shared.code_editor.actions.wrap_lines.label')"
                        :title="$t('shared.code_editor.actions.wrap_lines.title')"
                        class="my-1 py-0"
                        hide-details/>

            <v-divider class="mb-2"/>

            <a href="https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts"
               rel="nofollow"
               target="_blank">
              {{ $t('shared.code_editor.actions.keyboard_shortcuts.text') }}
            </a>
          </div>
        </settings-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import store from '@/store'
  import { vuexAccessors } from '@/helpers/store'
  import { editorUtils, initializeSnippets } from '@/mixins/CodeEditorUtils'
  import { parseJsonBigInt } from '@/helpers/json_parse'
  import { beautify } from '@/helpers'
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'
  import CopyButton from '@/components/shared/CopyButton'

  export default {
    name: 'code-editor',
    components: {
      CopyButton,
      SettingsDropdown
    },
    props: {
      value: {
        type: String,
        default: '{}'
      },
      externalCommands: {
        type: Array,
        default: () => {
          return []
        }
      }
    },
    setup (props, context) {
      const editor = ref(null)
      const { useSpaces, wrapLines } = vuexAccessors('codeEditor', ['useSpaces', 'wrapLines'])
      const { setTheme, setWhitespace, setWrapLines, unmountEditor, setupAceEditor, copyContent } = editorUtils(editor)
      const { completer } = initializeSnippets()

      const valid = computed(() => {
        if (typeof props.value === 'object') return true
        if (props.value === '') return true
        try {
          parseJsonBigInt(props.value)
          return true
        } catch (error) {
          return false
        }
      })

      watch(() => props.value, newValue => {
        if (editor.value.getValue() !== newValue) {
          const beautifulValue = beautify(newValue, useSpaces.value)
          setEditorValue(beautifulValue)
        }
      })

      watch(() => store.state.theme.dark, newValue => {
        setTheme(newValue)
      })

      watch(wrapLines, setWrapLines)
      watch(useSpaces, newValue => {
        setWhitespace(newValue)
        beautifyEditorValue(newValue)
      })

      onMounted(() => {
        setupAceEditor(editor.value, {
          enableBasicAutocompletion: [completer],
          enableLiveAutocompletion: true,
          enableSnippets: true
        })
        setWrapLines(wrapLines.value)
        setTheme(store.state.theme.dark)
        const beautifulValue = beautify(props.value, useSpaces.value)
        setEditorValue(beautifulValue)
        editor.value.commands.addCommands(props.externalCommands)
        editor.value.commands.addCommand({
          bindKey: { win: 'Ctrl+Alt+L', mac: 'Command+Alt+L', linux: 'Ctrl+Alt+L' },
          exec: () => {
            beautifyEditorValue(useSpaces.value)
          }
        })

        editor.value.on('change', () => {
          context.emit('input', editor.value.getValue())
        })
      })

      onBeforeUnmount(unmountEditor)

      const beautifyEditorValue = useSpaces => {
        const newValue = beautify(editor.value.getValue(), useSpaces)
        setEditorValue(newValue)
      }

      const setEditorValue = value => {
        editor.value.setValue(value, 1)
      }

      const settingsOpen = ref(false)
      const toggleSettings = () => {
        settingsOpen.value = !settingsOpen.value
      }

      return {
        editor,
        useSpaces,
        wrapLines,
        valid,
        beautifyEditorValue,
        toggleSettings,
        copyContent,
        settingsOpen
      }
    }
  }
</script>
