'use babel'
import applyStyles from './lib/config'
import openPreviewPaneItem from './lib/previewPaneItem'


let subscriptions
export default {

    activate: () => {
      atom.notifications.addInfo("Hue Shift syntax theme activated");
      subscriptions = atom.config.observe(
        'hue-shift-syntax',
        () => {
          let conf = atom.config.get('hue-shift-syntax')
          console.log(conf);
          applyStyles({
            ...conf.main,
            ...conf.filter,
            ...conf.modifiers,
          })
        })

      atom.commands.add('atom-workspace', {
        'hue-shift:open-preview-tab': openPreviewPaneItem,
      })
    },

    deactivate: () => {
      atom.notifications.addInfo("Hue Shift syntax theme deactivated")
      subscriptions.dispose()
    }
}
