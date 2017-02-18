'use babel'
import applyStyles from './config'
import openPreviewPaneItem from './previewPaneItem'
import SettingsManager from './SettingsManager'
import showPrompt from './views/PresetTitlePrompt'

window.prompt = showPrompt
let subscriptions,

    commands = {
      'hue-shift:open-preview': openPreviewPaneItem },

    onConfigChange = () => {
      let conf = atom.config.get('hue-shift-syntax')
      let args = { ...conf.main,
        ...conf.filter,
        ...conf.modifiers }
      applyStyles(args) },

    register = (cmds, scope='atom-workspace') =>
      atom.commands.add(scope, cmds),

    observe = (callback, scope='hue-shift-syntax') =>
      atom.config.observe(scope, callback)


let manager
export default {

    activate: () => {
      console.warn("Activation starting", this)
      console.warn(atom.packages.getLoadedPackages())
      manager = manager || new SettingsManager()
      console.warn(manager)
      subscriptions = observe(onConfigChange)
      console.warn(subscriptions)
      register(commands) },

    deactivate: () =>
      subscriptions.dispose() }
