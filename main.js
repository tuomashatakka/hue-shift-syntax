'use babel'

export default {
  activate: () => {
    atom.notifications.addInfo("Hue Shift syntax theme activated");
  },
  deactivate: () => {
    atom.notifications.addInfo("Hue Shift syntax theme deactivated")
  }
}
