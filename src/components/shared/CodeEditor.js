import Brace from 'brace'

require('brace/mode/json')
require('brace/theme/monokai')
require('brace/ext/searchbox')

export default {
  data () {
    return {
      editor: null
    }
  },
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
    },
    wrapLines: {
      type: Boolean,
      default: false
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
      this.editor = Brace.edit(this.$el, { autoScrollEditorIntoView: true })
      this.$emit('init', this.editor)
      this.editor.getSession().setUseWorker(this.readOnly ? false : this.useWorker)
      this.editor.getSession().setMode('ace/mode/json')
      this.editor.getSession().setUseWrapMode(this.wrapLines)
      this.editor.setFontSize('14px')
      this.editor.$blockScrolling = Infinity
      this.setTheme(this.$store.state.theme.dark)
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
    }
  },
  mounted () {
    this.setupAceEditor()

    this.setEditorValue(this.value)
    if (this.readOnly) {
      this.editor.setReadOnly(true)
      this.editor.setShowPrintMargin(false)
    } else {
      this.editor.commands.addCommands(this.externalCommands)
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
  render: function (createElement) {
    return createElement('div', { attrs: { style: 'height: 100%; width: 100%' }, class: 'bordered' })
  }
}
