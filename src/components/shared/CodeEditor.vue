<template>
  <div class="bordered code-editor">
    <div ref="editor" style="height: 100%; width: 100%"/>

    <div class="code-editor__actions pa-2">
      <v-btn v-if="!readOnly"
             :disabled="!valid"
             small
             title="Beautify (Ctrl+ALT+L)"
             class="vertical-align--top mr-2"
             @click="beautify">
        <v-icon small>mdi-code-braces</v-icon>
      </v-btn>

      <v-btn-toggle v-model="settings" multiple>
        <v-btn v-if="!readOnly" text small title="Use 2 spaces for beautify (instead of tabs)">
          <v-icon small>mdi-keyboard-space</v-icon>
        </v-btn>
        <v-btn text small title="Wrap lines">
          <v-icon small>mdi-wrap</v-icon>
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
</template>

<script>
  import Brace from 'brace'
  import 'brace/mode/json'
  import 'brace/theme/monokai'
  import 'brace/ext/searchbox'

  export default {
    props: {
      value: {
        type: null, // any
        default: ''
      },
      readOnly: {
        type: Boolean,
        default: false
      },
      externalCommands: {
        type: Array,
        default: () => {
          return []
        }
      },
      useWorker: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        editor: null,
        settings: []
      }
    },
    computed: {
      darkTheme () {
        return this.$store.state.theme.dark
      },
      wrapLines () {
        return this.settings.includes(1)
      },
      valid () {
        if (this.value === '') return true
        try {
          (JSON.parse(this.value))
          return true
        } catch (error) {
          return false
        }
      }
    },
    watch: {
      darkTheme (value) {
        this.setTheme(value)
      },
      wrapLines (value) {
        this.editor.getSession().setUseWrapMode(value)
      },
      value (value) {
        if (this.editor.getValue() !== value) {
          this.setEditorValue(value)
        }
      },
      settings (value) {
        if (value.includes(0)) {
          this.editor.getSession().setTabSize(2)
          this.editor.getSession().setUseSoftTabs(true)
        } else {
          this.editor.getSession().setTabSize(4)
          this.editor.getSession().setUseSoftTabs(false)
          this.beautify()
        }
      }
    },
    mounted () {
      this.setupAceEditor()

      this.setEditorValue(this.value)
      if (this.readOnly) {
        this.editor.setReadOnly(true)
      } else {
        this.editor.commands.addCommands(this.externalCommands)
        this.editor.commands.addCommand({
          bindKey: { win: 'Ctrl+Alt+L', mac: 'Command+Alt+L', linux: 'Ctrl+Alt+L' },
          exec: this.beautify
        })
      }

      /* istanbul ignore next */
      this.editor.on('change', () => {
        this.$emit('input', this.editor.getValue())
      })
    },
    beforeDestroy () {
      this.editor.destroy()
      this.editor.container.remove()
    },
    methods: {
      beautify () {
        if (this.value) {
          let newValue = this.stringifyJson(JSON.parse(this.editor.getValue()))
          this.$emit('input', newValue)
        }
      },
      setTheme (dark) {
        if (dark) {
          this.editor.setTheme('ace/theme/monokai')
        } else {
          this.editor.setTheme('ace/theme/textmate')
        }
      },
      setEditorValue (value) {
        if (typeof value === 'string') {
          this.editor.setValue(value, 1)
        } else {
          this.editor.setValue(this.stringifyJson(value), 1)
        }
      },
      setupAceEditor () {
        this.editor = Brace.edit(this.$refs.editor, { autoScrollEditorIntoView: true })
        this.$emit('init', this.editor)
        this.editor.getSession().setUseWorker(this.readOnly ? false : this.useWorker)
        this.editor.getSession().setMode('ace/mode/json')
        this.editor.getSession().setUseWrapMode(this.wrapLines)
        this.editor.setFontSize('13px')
        this.editor.setShowPrintMargin(false)
        this.editor.$blockScrolling = Infinity
        this.setTheme(this.$store.state.theme.dark)
      },
      stringifyJson (value) {
        let useSpaces = this.settings.includes(0)
        return JSON.stringify(value, null, useSpaces ? '  ' : '\t')
      }
    }
  }
</script>
