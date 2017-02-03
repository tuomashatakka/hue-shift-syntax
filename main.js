'use babel'
import applyStyles from './lib/config'


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
    },

    deactivate: () => {
      atom.notifications.addInfo("Hue Shift syntax theme deactivated")
      subscriptions.dispose()
    }
}
