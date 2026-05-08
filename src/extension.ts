import * as vscode from 'vscode'
import { applyTheme, clearTheme, applyThemeDefinition } from './ThemeApplicator'
import { hueShiftPlugin, generateTheme, validateSettings } from './Plugin'
import type { HueShiftSettings, ThemeDefinition } from './types'
import { computePalette } from './ColorEngine'


/**
 * Read settings from VS Code configuration.
 * Validates and clamps values to their defined ranges.
 */
function readSettings(): HueShiftSettings {
  const c = vscode.workspace.getConfiguration('hueShift')
  return validateSettings({
    hue: c.get('hue'),
    saturation: c.get('saturation'),
    luminance: c.get('luminance'),
    aberration: c.get('aberration'),
    drift: c.get('drift'),
    backgroundLevel: c.get('backgroundLevel'),
    dimMinor: c.get('dimMinor'),
    tint: c.get('tint'),
    tintStrength: c.get('tintStrength'),
    brightness: c.get('brightness'),
    contrast: c.get('contrast'),
  })
}

/**
 * Apply the current settings by generating a complete theme.
 * Uses the new plugin framework for color calculation.
 */
function applyCurrentSettings(): void {
  const settings = readSettings()
  
  try {
    // Use the plugin to generate a complete theme definition
    const theme: ThemeDefinition = hueShiftPlugin.generateTheme(settings)
    
    // Apply the theme through the applicator
    applyThemeDefinition(theme).catch(err =>
      vscode.window.showErrorMessage(`Hue Shift: failed to apply theme — ${err}`),
    )
  } catch (err) {
    vscode.window.showErrorMessage(`Hue Shift: error generating theme — ${err}`)
  }
}

/**
 * Register commands for the extension.
 */
function registerCommands(context: vscode.ExtensionContext): void {
  // Command to manually refresh the theme
  const refreshCommand = vscode.commands.registerCommand(
    'hueShift.refreshTheme',
    () => applyCurrentSettings(),
  )

  // Command to show current theme info
  const showInfoCommand = vscode.commands.registerCommand(
    'hueShift.showThemeInfo',
    async () => {
      const settings = readSettings()
      const theme = hueShiftPlugin.generateTheme(settings)
      const bgColor = theme.colors['editor.background'] || '#000000'
      const fgColor = theme.colors['editor.foreground'] || '#ffffff'
      
      const info = `Hue Shift Theme

━━━━━━━━━━━━

Name: ${theme.name || 'Hue Shift'}
Type: ${theme.type || 'unknown'}
Hue: ${settings.hue}°
Saturation: ${settings.saturation}%
Luminance: ${settings.luminance}%

Background: ${bgColor}
Foreground: ${fgColor}

Token Rules: ${theme.tokenColors.textMateRules?.length || 0}
Workbench Colors: ${Object.keys(theme.colors).length}

━━━━━━━━━━━━`
      
      const doc = await vscode.workspace.openTextDocument({
        content: info,
        language: 'markdown',
      })
      await vscode.window.showTextDocument(doc, { preview: true })
    },
  )

  // Command to export current theme as JSON
  const exportCommand = vscode.commands.registerCommand(
    'hueShift.exportTheme',
    async () => {
      const settings = readSettings()
      const theme = hueShiftPlugin.generateTheme(settings)
      const json = JSON.stringify(theme, null, 2)
      
      const doc = await vscode.workspace.openTextDocument({
        content: json,
        language: 'json',
      })
      await vscode.window.showTextDocument(doc, { preview: true })
    },
  )

  context.subscriptions.push(refreshCommand, showInfoCommand, exportCommand)
}

export function activate(context: vscode.ExtensionContext): void {
  // Apply the initial theme
  applyCurrentSettings()

  // Register configuration watcher
  const watcher = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('hueShift')) {
      applyCurrentSettings()
    }
  })

  // Register commands
  registerCommands(context)

  context.subscriptions.push(watcher)
}

export function deactivate(): Thenable<void> {
  // Clear the cached theme
  hueShiftPlugin.clearCache()
  return clearTheme()
}

// Export the plugin instance for use by other extensions
export { hueShiftPlugin, generateTheme, validateSettings } from './Plugin'
export type { ThemeDefinition, HueShiftSettings } from './types'
