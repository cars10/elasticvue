import { EditorView, ViewPlugin } from '@codemirror/view'

export const quasarSearchPanelEscapeExtension = ViewPlugin.fromClass(
  class {
    private stealFollowingKeyup = false
    private readonly onKeydown: (e: KeyboardEvent) => void
    private readonly onKeyup: (e: KeyboardEvent) => void

    constructor(private view: EditorView) {
      this.onKeydown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return
        const ae = this.view.dom.ownerDocument.activeElement
        if (!(ae instanceof HTMLElement)) return
        const panel = ae.closest('.cm-panel.cm-search')
        if (!panel || !this.view.dom.contains(panel)) return
        this.stealFollowingKeyup = true
      }
      this.onKeyup = (e: KeyboardEvent) => {
        if (e.key !== 'Escape' || !this.stealFollowingKeyup) return
        this.stealFollowingKeyup = false
        e.stopPropagation()
      }
      this.view.dom.addEventListener('keydown', this.onKeydown, true)
      this.view.dom.addEventListener('keyup', this.onKeyup)
    }

    destroy() {
      this.view.dom.removeEventListener('keydown', this.onKeydown, true)
      this.view.dom.removeEventListener('keyup', this.onKeyup)
    }
  }
)
