'use babel'
import { Emitter, TextBuffer, TextEditor } from 'atom'


let modalInstance


export function getPromptModal (opts) {
  if (modalInstance)
    return modalInstance

  let item        = document.createElement('div')
  let modal       = atom.workspace.addModalPanel({ item })
  let buffer      = new TextBuffer(opts ? opts.default : null)
  let editor      = new TextEditor({ buffer, mini: true })
  modal.editor    = editor
  modal.element   = item
  item.appendChild(editor.element)
  return modal
}


export class PromptView extends Emitter {

  constructor (opts={}) {

    super()
    let getTitle    = () => "Name"
    let { grammar } = opts || { grammar: 'source.js' }

    this.panel = getPromptModal(opts)
    this.panel.show()
    this.editor = this.panel.editor
    this.editor.element.addEventListener('blur', e => {
      this.panel.hide()
    })
    this.editor.element.addEventListener('keyup', e => {
      let { key } = e
      let model =  this.emit('key:enter', this.editor)
      if (key === 'Escape') {
        this.emit('cancel', [model])
        this.panel.hide()
      }
      else if (key === 'Enter') {
        this.emit('success', [model])
        this.panel.hide()
      }
    })
    this.editor.element.focus()
  }
}


let view

export default function (opts={}) {
  view = view || new PromptView(opts)
  view.editor.selectAll()
  if (!view.editor.element.hasFocus())
    view.editor.element.focus()

  if (opts.hide)
    view.panel.hide()
  else
    view.panel.show()

  return view
}
