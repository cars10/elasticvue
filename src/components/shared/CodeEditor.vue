<template>
  <div class="bordered code-editor">
    <div ref="editor" style="height: 100%; width: 100%"/>

    <div class="code-editor__actions">
      <settings-dropdown>
        <div class="px-3 pb-3" style="white-space: nowrap">
          <v-btn :disabled="!valid"
                 class="mb-2"
                 title="Beautify (Ctrl+ALT+L)"
                 small
                 @click="beautifyEditorValue(useSpaces)">
            <v-icon small class="mr-2">mdi-auto-fix</v-icon>
            Beautify
          </v-btn>

          <v-divider/>

          <v-checkbox v-model="useSpaces"
                      label="Use spaces"
                      title="Change whitespace to 2 spaces instead of tabs"
                      class="my-1 py-0"
                      hide-details/>

          <v-checkbox v-model="wrapLines"
                      label="Wrap lines"
                      title="Wrap long lines"
                      class="my-1 py-0"
                      hide-details/>

          <v-divider class="mb-2"/>

          <a target="_blank"
             rel="nofollow"
             href="https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts">
            Keyboard shortcuts
          </a>
        </div>
      </settings-dropdown>
    </div>
  </div>
</template>

<script>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from '@vue/composition-api'
  import store from '@/store'
  import { vuexAccessors } from '@/helpers/store'
  import { editorUtils, initializeSnippets } from '@/mixins/CodeEditorUtils'
  import { parseJsonBigInt } from '@/helpers/json_parse'
  import { beautify } from '@/helpers'
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'

  export default {
    name: 'code-editor',
    components: {
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
      const { setTheme, setWhitespace, setWrapLines, unmountEditor, setupAceEditor } = editorUtils(editor)
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
        setupAceEditor(context.refs.editor, {
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
        useSpaces,
        wrapLines,
        valid,
        beautifyEditorValue,
        toggleSettings,
        settingsOpen
      }
    }
  }
</script>
