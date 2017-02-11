'use babel'
import applyStyles from './config'
import openPreviewPaneItem from './previewPaneItem'


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


export default {

    activate: () => {
      subscriptions = observe(onConfigChange)
      console.warn(subscriptions)
      register(commands) },

    deactivate: () =>
      subscriptions.dispose() }
