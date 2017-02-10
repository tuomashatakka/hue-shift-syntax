'use babel'
import React from 'react'
import dom from 'react-dom'
import Preview from './views/Preview'
import { readFileSync } from 'fs'
import { TextBuffer, TextEditor } from 'atom'

const contents = readFileSync(__filename, 'utf8')
const defaults = {
  grammar: 'source.js'
}


export default function previewPaneItem(opts) {

  let { grammar } = opts || defaults
  grammar = defaults.grammar
  let getTitle  = () => "Editor Preview"
  let buffer    = new TextBuffer(contents)
  let editor    = new TextEditor({ buffer })
  let element   = document.createElement('div')

  let language  = atom.grammars.grammarForScopeName(grammar)
  let pane      = atom.workspace.getActivePane()
  let item      = pane.items.find(o => o.getTitle() === getTitle()) ||
                  pane.addItem({ getTitle, element, editor })

  console.info(language, grammar)
  editor.setGrammar(language)
  pane.activateItem(item)
  dom.render( <Preview editor={editor} />, element )

  return item
}
