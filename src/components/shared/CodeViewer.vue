<template>
  <div class="bordered code-editor">
    <div ref="editor" style="height: 100%; width: 100%"/>

    <div class="code-editor__actions">
      <v-btn icon class="mr-1" title="Copy content" @click="copyContent">
        <v-icon>mdi-content-copy</v-icon>
      </v-btn>

      <settings-dropdown>
        <div class="px-3 pb-3" style="white-space: nowrap">
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
        </div>
      </settings-dropdown>
    </div>
  </div>
</template>

<script>
  import { vuexAccessors } from '@/helpers/store'
  import { onBeforeUnmount, onMounted, ref, watch } from '@vue/composition-api'
  import store from '@/store'
  import { editorUtils } from '@/mixins/CodeEditorUtils'
  import { beautify } from '@/helpers'
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'

  export default {
    name: 'code-viewer',
    components: {
      SettingsDropdown
    },
    props: {
      value: {
        type: null, // any
        default: ''
      },
      focus: {
        type: Boolean,
        default: true
      }
    },
    setup (props, context) {
      const editor = ref(null)
      const { useSpaces, wrapLines } = vuexAccessors('codeEditor', ['useSpaces', 'wrapLines'])
      const { setTheme, setWhitespace, setWrapLines, unmountEditor, setupAceEditor, copyContent } = editorUtils(editor)

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
        setupAceEditor(context.refs.editor, { readOnly: true })
        setWrapLines(wrapLines.value)
        setTheme(store.state.theme.dark)
        if (props.value) {
          const beautifulValue = beautify(props.value, useSpaces.value)
          setEditorValue(beautifulValue)
        }
        if (props.focus) editor.value.focus()
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
        copyContent
      }
    }
  }
</script>
