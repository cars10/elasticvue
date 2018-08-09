const Brace = import('brace')
import('brace/mode/json')
import('brace/theme/monokai')

export default {
  data () {
    return {
      editor: null
    }
  },
  props: {
    value: {
      default: () => {
        return {}
      },
      type: [Object, String]
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    externalHandler: {
      type: Function,
      default: () => {
      }
    },
    useWorker: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    darkTheme () {
      return this.$store.state.theme.dark
    }
  },
  methods: {
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
        this.editor.setValue(JSON.stringify(value, null, '\t'), 1)
      }
    },
    setupAceEditor () {
      this.editor = Brace.edit(this.$el, {autoScrollEditorIntoView: true})
      this.$emit('init', this.editor)
      this.editor.getSession().setUseWorker(this.useWorker)
      this.editor.getSession().setMode('ace/mode/json')
      this.editor.setFontSize('14px')
      this.editor.$blockScrolling = Infinity
      this.setTheme(this.$store.state.theme.dark)
    }
  },
  watch: {
    darkTheme (value) {
      this.setTheme(value)
    },
    value (value) {
      if (this.readOnly) this.setEditorValue(value)
    }
  },
  mounted () {
    this.setupAceEditor()

    this.setEditorValue(this.value)
    if (this.readOnly) {
      this.editor.setReadOnly(true)
      this.editor.setShowPrintMargin(false)
    } else {
      this.editor.commands.addCommand({
        name: 'externalHandler',
        bindKey: {win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER'},
        exec: this.externalHandler
      })
    }

    this.editor.on('change', () => {
      this.$emit('input', this.editor.getValue())
    })
  },
  beforeDestroy () {
    this.editor.destroy()
    this.editor.container.remove()
  },
  render: function (createElement) {
    return createElement('div', {attrs: {style: 'height: 100%; width: 100%'}, class: 'bordered'})
  }
}
