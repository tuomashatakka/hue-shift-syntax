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
let preview
let getTitle = () => "Editor Preview"


export function activatePreviewTab() {
  let element     = preview ? preview.element : document.createElement('div')
  // let buffer      = new TextBuffer()
  let editor      = null//  = preview ? preview.editor : new TextEditor({ buffer })
  let pane        = (atom.workspace.getLeftDock ? atom.workspace.getLeftDock() : atom.workspace).getActivePane()
  let item        = pane.items.find(o => o.getTitle() === getTitle()) ||
                    pane.addItem({
                      getTitle,
                      element,
                      editor,
                      getDefaultLocation: ()=>'left' })
  pane.activateItem(item)
  return item
}

export default function openPreviewPaneItem(opts) {
  if (preview)
    return activatePreviewTab()

  // let { grammar } = opts || { grammar: 'source.js' }
  // let language    = atom.grammars.grammarForScopeName('source.js')
  let pane        = activatePreviewTab()
  preview         = pane
  // preview.editor.setGrammar(language)
  // atom.textEditors.selectGrammarForEditor(preview.editor)
  dom.render( <Preview
    editor={preview.editor}
    choices={choices}
    updatePreview={(g) => updatePreview(preview.editor, g)} />,
    preview.element )

  // updatePreview(preview.editor, 'source.js')
  return preview
}

export function getPreviewButton () {
  let btn = document.createElement('button')
  btn.classList.add('btn')
  btn.innerHTML = "Open preview"
  btn.addEventListener('click', () => openPreviewPaneItem())
  return btn
}
