<template>
  <div class="bordered code-editor">
    <div ref="editor" style="height: 100%; width: 100%"/>

    <div class="code-editor__actions pa-1">
      <v-btn :disabled="!valid"
             class="vertical-align--top mr-2"
             small
             style="height: 32px"
             title="Beautify (Ctrl+ALT+L)"
             @click="beautifyEditorValue(useSpaces)">
        <v-icon small>mdi-auto-fix</v-icon>
      </v-btn>

      <btn-group class="d-inline-block" small>
        <v-btn :class="{'v-btn--active': useSpaces}"
               small
               title="Change whitespace to 2 spaces instead of tabs"
               @click="useSpaces = !useSpaces">
          <v-icon small>mdi-keyboard-space</v-icon>
        </v-btn>
        <v-btn :class="{'v-btn--active': wrapLines}"
               title="Wrap lines" @click="wrapLines = !wrapLines">
          <v-icon small>mdi-wrap</v-icon>
        </v-btn>
      </btn-group>

      <v-btn class="vertical-align--top ml-2"
             small
             text
             style="height: 32px"
             title="Show keyboard shortcuts"
             target="_blank"
             rel="nofollow"
             exact
             href="https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts">
        <v-icon small>mdi-keyboard</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from '@vue/composition-api'
  import store from '@/store'
  import { vuexAccessors } from '@/helpers/store'
  import BtnGroup from '@/components/shared/BtnGroup'
  import { editorUtils, initializeSnippets } from '@/mixins/CodeEditorUtils'
  import { parseJsonBigInt } from '@/helpers/json_parse'
  import { beautify } from '@/helpers'

  export default {
    name: 'code-editor',
    components: {
      BtnGroup
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

      return {
        useSpaces,
        wrapLines,
        valid,
        beautifyEditorValue
      }
    }
  }
</script>
