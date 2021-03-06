'use babel'

const MUTED = ['source', 'html', 'js', 'meta']
let change
let statusbar

const getItem = () => {
  let el = document.querySelector('.cursor-scope') ||
           document.createElement('div')
  el.setAttribute('class', 'cursor-scope')
  el.innerHTML = ""
  return el }

let item = getItem()

export default function devtools () {

  let args = { item, priority: 0 }
  statusbar = atom.views.getView(document.querySelector('.status-bar'))
  statusbar.addLeftTile(args)

  if (!statusbar)
    return setTimeout(devtools, 500)

  return atom.workspace.onDidChangeActivePaneItem(sub => {

    if (change) change.dispose()
    let editor = atom.workspace.getActiveTextEditor()

    if (!editor) return
    change = editor.onDidChangeCursorPosition(
      () => {
      let { scopes } = editor.getCursorScope()

      scopes = scopes
        .map(o => o.split('.').filter(o => MUTED.indexOf(o) === -1))
        .map(O => O.map(o => `<div class="badge badge-highlight syntax--${o}">${o}</div>`).join(' '))
        .join(' <span class="icon icon-chevron-right"></span> ')

      item.innerHTML =
        `<div class="full-scope"><strong>scope</strong> ${scopes}</div> `
    })
  })
}
