import Brace from 'brace'

require('brace/mode/json')
require('brace/theme/monokai')

export default {
  data () {
    return {
      editor: null
    }
  },
  props: {
    code: {
      default: () => {
        return {}
      }
    },
    readOnly: Boolean
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
        this.editor.setValue(value)
      } else {
        this.editor.setValue(JSON.stringify(value, null, '\t'))
      }
    }
  },
  watch: {
    darkTheme (value) {
      this.setTheme(value)
    }
  },
  mounted () {
    this.editor = Brace.edit(this.$el, {autoScrollEditorIntoView: true})
    this.$emit('init', this.editor)
    this.editor.getSession().setMode('ace/mode/json')
    this.editor.setFontSize(14)
    this.editor.$blockScrolling = Infinity

    this.setTheme(this.$store.state.theme.dark)

    this.setEditorValue(this.code)
    if (this.readOnly) this.editor.setReadOnly(true)

    this.editor.on('change', () => {
      this.$emit('update:code', this.editor.getValue())
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
