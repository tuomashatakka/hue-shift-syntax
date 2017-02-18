'use babel'
import React from 'react'
import dom from 'react-dom'
import Preview from './views/Preview'
import { join } from 'path'
import { readFileSync, readdirSync } from 'fs'
import { TextBuffer, TextEditor } from 'atom'

let contents        = readFileSync(__filename, 'utf8')
const PACKAGE_NAME  = 'hue-shift-syntax'
const basePath      = atom.packages.getLoadedPackage(PACKAGE_NAME).path
const previewPath   = (suffix) => join(basePath, 'fixtures', suffix)
const choices       = readdirSync(previewPath('.'))


function updatePreview (editor, scope) {
  let fpath     = previewPath(scope)
  let text      = readFileSync(fpath, 'utf8')
  let language  = atom.grammars.grammarForScopeName(scope)

  editor.setText(text)
  if (language) editor.setGrammar(language)
  else atom.textEditors.selectGrammarForEditor(editor)

  if (atom.devMode)
    console.info("Grammar change event", scope, editor.getGrammar())
}


export default function openPreviewPaneItem(opts) {

  let getTitle    = () => "Editor Preview"
  let { grammar } = opts || { grammar: 'source.js' }
  let buffer      = new TextBuffer(contents)
  let editor      = new TextEditor({ buffer })
  let element     = document.createElement('div')

  let pane        = atom.workspace.getActivePane()
  let item        = pane.items.find(o => o.getTitle() === getTitle()) ||
                    pane.addItem({ getTitle, element, editor })

  pane.activateItem(item)
  atom.textEditors.selectGrammarForEditor(editor)
  dom.render( <Preview editor={editor} choices={choices} updatePreview={(g) => updatePreview(editor, g)} />, element )

  return item
}

export function getPreviewButton () {
  let btn = document.createElement('button')
  btn.classList.add('btn')
  btn.innerHTML = "Open preview"
  btn.addEventListener('click', () => openPreviewPaneItem())
  return btn
}
