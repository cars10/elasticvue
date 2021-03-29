<template>
  <div class="bordered code-editor">
    <div ref="editor" style="height: 100%; width: 100%"/>

    <div class="code-editor__actions pa-2">
      <v-btn :disabled="!valid"
             class="vertical-align--top mr-2"
             small
             style="height: 32px"
             title="Beautify (Ctrl+ALT+L)"
             @click="beautify">
        <v-icon small>mdi-auto-fix</v-icon>
      </v-btn>

      <btn-group class="d-inline-block">
        <v-btn :class="{'v-btn--active': useSpaces}" title="Change whitespace to 2 spaces instead of tabs"
               @click="useSpaces = !useSpaces">
          <v-icon small>mdi-keyboard-space</v-icon>
        </v-btn>
        <v-btn :class="wrapLines ? 'v-btn--active' : ''" title="Wrap lines" @click="wrapLines = !wrapLines">
          <v-icon small>mdi-wrap</v-icon>
        </v-btn>
      </btn-group>
    </div>
  </div>
</template>

<script>
  import { computed, onBeforeUnmount, onMounted, ref, watch } from '@vue/composition-api'
  import store from '@/store'
  import { compositionVuexAccessors } from '@/helpers/store'
  import BtnGroup from '@/components/shared/BtnGroup'
  import { editorUtils, initializeSnippets } from '@/mixins/CodeEditorUtils'

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
      const { useSpaces, wrapLines } = compositionVuexAccessors('codeEditor', ['useSpaces', 'wrapLines'])
      const { setTheme, setWhitespace, setWrapLines, unmountEditor, setupAceEditor } = editorUtils(editor)
      const { completer } = initializeSnippets()

      const valid = computed(() => {
        if (typeof props.value === 'object') return true
        if (props.value === '') return true
        try {
          JSON.parse(props.value)
          return true
        } catch (error) {
          return false
        }
      })

      watch(() => props.value, newValue => {
        if (editor.value.getValue() !== newValue) setEditorValue(newValue)
      })

      watch(() => store.state.theme.dark, newValue => {
        setTheme(newValue)
      })

      watch(wrapLines, setWrapLines)
      watch(useSpaces, newValue => {
        setWhitespace(newValue)
        beautify()
      })

      onMounted(() => {
        setupAceEditor(context.refs.editor, {
          enableBasicAutocompletion: [completer],
          enableLiveAutocompletion: true,
          enableSnippets: true
        })
        setWrapLines(wrapLines.value)
        setTheme(store.state.theme.dark)
        setEditorValue(props.value)
        editor.value.commands.addCommands(props.externalCommands)
        editor.value.commands.addCommand({
          bindKey: { win: 'Ctrl+Alt+L', mac: 'Command+Alt+L', linux: 'Ctrl+Alt+L' },
          exec: beautify
        })

        editor.value.on('change', () => {
          context.emit('input', editor.value.getValue())
        })
      })

      onBeforeUnmount(unmountEditor)

      const beautify = () => {
        if (props.value) {
          try {
            const newValue = stringifyJson(JSON.parse(editor.value.getValue()))
            context.emit('input', newValue)
          } catch (error) {
          }
        }
      }

      const setEditorValue = value => {
        editor.value.setValue(value, 1)
        beautify()
      }

      const stringifyJson = value => {
        return JSON.stringify(value, null, useSpaces.value ? '  ' : '\t')
      }

      return {
        useSpaces,
        wrapLines,
        valid,
        beautify
      }
    }
  }
</script>
