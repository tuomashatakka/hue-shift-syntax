'use babel'
import applyStyles from './lib/config'
import openPreviewPaneItem from './lib/previewPaneItem'


let subscriptions,

    commands = {
      'hue-shift:open-preview': openPreviewPaneItem },

    onConfigChange = () => {
      let conf = atom.config.get('hue-shift-syntax')
      applyStyles({
        ...conf.main,
        ...conf.filter,
        ...conf.modifiers }) },

    register = (cmds, scope='atom-workspace') => 
      atom.commands.add(scope, cmds),

    observe = (callback, scope='hue-shift-syntax') =>
      atom.config.observe(scope, callback)


export default {

    activate: () => {
      subscriptions =
      observe(onConfigChange)
      register(commands) },

    deactivate: () =>
      subscriptions.dispose() }
