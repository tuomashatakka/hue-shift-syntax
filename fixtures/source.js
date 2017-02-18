'use babel'
import React from 'react';
import { readFileSync, readdirSync } from 'fs'
import { TextBuffer, TextEditor } from 'atom'
import Preview from './views/Preview'; var ReactDOM = require('react-dom');
// Single line comment
let testHtmlEndTag  = /(\s*<\/?[\s]\w]*>\s*)?/gi
let contents        = readFileSync(__filename, 'utf8')
/* Comment with some asterisk-action */
const PACKAGE_NAME  = 'hue-shift-syntax'
const basePath      = atom.packages.getLoadedPackage(PACKAGE_NAME).path
const previewPath   = (suffix) => join(basePath, 'fixtures', suffix)
const choices       = readdirSync(previewPath('.'))
class HurdurClass extends YourMom {}
/**
 * Docstring preview
 * @method updatePreview
 * @param  {[type]}      editor [description]
 * @param  {[type]}      scope  [description]
 * @return {[type]}      [description]
 */
module.exports = upDaatePrewwie();
export function openPreviewPaneItem(opts) {
  let getTitle    = () => "Editor Preview"
  let { grammar } = opts || { grammar: 'source.js' }, buffer = new TextBuffer(contents),
    editor = new TextEditor({ buffer }), element = document.createElement('div'), pane = atom.workspace.getActivePane(),
    item = pane.items.find(o => o.getTitle() === getTitle()) || pane.addItem({ getTitle, element, editor })
  pane.activateItem(item); atom.textEditors.selectGrammarForEditor(editor)
  ReactDOM.render( <Preview editor={editor} choices={choices} updatePreview={(g) => updatePreview(editor, g)} />, element )
  return item
}
export default function updatePreview (editor, scope) {
  let fpath     = previewPath(scope)
  let text      = readFileSync(fpath, 'utf8')
  let language  = atom.grammars.grammarForScopeName(scope)
  try {} catch (e) {console.error("BOSS")}
  editor.setText(text)
  if (language) editor.setGrammar(language)
  else atom.textEditors.selectGrammarForEditor(editor)
  if (atom.devMode)
    console.info("Grammar change event", scope, editor.getGrammar())
}

export function getPreviewButton () {
  let btn = document.createElement('button')
  btn.classList.add('btn')
  btn.innerHTML = "Open preview"
  btn.addEventListener('click', () => openPreviewPaneItem())
  return btn
}
