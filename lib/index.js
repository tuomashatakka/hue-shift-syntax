'use babel'
import { CompositeDisposable } from 'atom'
import applyStyles from './config'
import openPreviewPaneItem from './previewPaneItem'
import SettingsManager from './SettingsManager'
import showPrompt from './views/PresetTitlePrompt'
import devtools from './devtools'

window.prompt = showPrompt

let subscriptions = new CompositeDisposable(),

  commands = {
    'hue-shift:open-preview': openPreviewPaneItem },

  onConfigChange = () => {
    let conf = atom.config.get('hue-shift-syntax')
    let args = { ...conf.main, ...conf.filter, ...conf.modifiers, ...conf.fine }
    applyStyles(args) },

  register = (cmds, scope='atom-workspace') =>
    subscriptions.add(atom.commands.add(scope, cmds)),

  observe = (callback, scope='hue-shift-syntax') =>
    subscriptions.add(atom.config.observe(scope, callback))


let manager
export default {

  activate: () => {
    manager = manager || new SettingsManager()
    observe(onConfigChange)
    register(commands) },

  deactivate: () =>
    subscriptions.dispose(),

}
