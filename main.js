'use babel'
import applyStyles from './lib/config'


let disposables
export default {

    activate: () => {
      atom.notifications.addInfo("Hue Shift syntax theme activated");
      disposables = atom.config.observe(
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
      disposables.dispose()
    }
}
