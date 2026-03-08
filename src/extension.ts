import * as vscode from 'vscode'
import { computePalette } from './ColorEngine'
import { applyTheme, clearTheme } from './ThemeApplicator'
import type { HueShiftSettings } from './types'


function readSettings (): HueShiftSettings {
  const c = vscode.workspace.getConfiguration('hueShift')
  return {
    hue:             c.get('hue', 250),
    saturation:      c.get('saturation', 70),
    luminance:       c.get('luminance', 70),
    aberration:      c.get('aberration', 60),
    drift:           c.get('drift', 30),
    backgroundLevel: c.get('backgroundLevel', 30),
    dimMinor:        c.get('dimMinor', 40),
    tint:            c.get('tint', '#808080'),
    tintStrength:    c.get('tintStrength', 0),
    brightness:      c.get('brightness', 100),
    contrast:        c.get('contrast', 100),
  }
}

function applyCurrentSettings (): void {
  const settings = readSettings()
  const palette = computePalette(settings)
  applyTheme(palette).catch(err =>
    vscode.window.showErrorMessage(`Hue Shift: failed to apply theme — ${err}`),
  )
}

export function activate (context: vscode.ExtensionContext): void {
  applyCurrentSettings()

  const watcher = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('hueShift'))
      applyCurrentSettings()
  })

  context.subscriptions.push(watcher)
}

export function deactivate (): Thenable<void> {
  return clearTheme()
}
