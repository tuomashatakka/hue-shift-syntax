'use babel'
import applyStyles from './config'
import openPreviewPaneItem from './previewPaneItem'
import SettingsManager from './SettingsManager'
import showPrompt from './views/PresetTitlePrompt'
import devtools from './devtools'

window.prompt = showPrompt

let subscriptions,

  commands = {
    'hue-shift:open-preview': openPreviewPaneItem },

  onConfigChange = () => {
    let conf = atom.config.get('hue-shift-syntax')
    let args = { ...conf.main, ...conf.filter, ...conf.modifiers }
    applyStyles(args) },

  register = (cmds, scope='atom-workspace') =>
    atom.commands.add(scope, cmds),

  observe = (callback, scope='hue-shift-syntax') =>
    atom.config.observe(scope, callback)


let manager
export default {

  activate: () => {
    manager = manager || new SettingsManager()
    subscriptions = observe(onConfigChange)
    register(commands)
    atom.devMode && devtools() },

  deactivate: () =>
    subscriptions.dispose(),

}
