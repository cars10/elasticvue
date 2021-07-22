<template>
  <div class="bordered code-editor">
    <div ref="editor" style="height: 100%; width: 100%"/>

    <div class="code-editor__actions pa-2">
      <btn-group class="d-inline-block">
        <v-btn :class="{'v-btn--active': useSpaces}" :title="$t('shared.code-editor.whitespace-tabs')"
               @click="useSpaces = !useSpaces">
          <v-icon small>mdi-keyboard-space</v-icon>
        </v-btn>
        <v-btn :class="wrapLines ? 'v-btn--active' : ''" :title="$t('shared.code-editor.wrap-lines')" @click="wrapLines = !wrapLines">
          <v-icon small>mdi-wrap</v-icon>
        </v-btn>
      </btn-group>
    </div>
  </div>
</template>

<script>
  import { vuexAccessors } from '@/helpers/store'
  import { onBeforeUnmount, onMounted, ref, watch } from '@vue/composition-api'
  import store from '@/store'
  import BtnGroup from '@/components/shared/BtnGroup'
  import { editorUtils } from '@/mixins/CodeEditorUtils'
  import { beautify } from '@/helpers'

  export default {
    name: 'code-viewer',
    components: {
      BtnGroup
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
      const { setTheme, setWhitespace, setWrapLines, unmountEditor, setupAceEditor } = editorUtils(editor)

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
        wrapLines
      }
    }
  }
</script>
