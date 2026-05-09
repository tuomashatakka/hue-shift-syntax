import * as vscode from 'vscode'
import {
  ColorPalette,
  ThemeDefinition,
  HueShiftSettings,
} from './types'
import { hueShiftPlugin, generateTheme } from './Plugin'

/**
 * Theme application configuration.
 */
export interface ApplyThemeOptions {

  /** Target configuration scope */
  target: vscode.ConfigurationTarget;

  /** Whether to apply workbench colors */
  applyWorkbench?: boolean;

  /** Whether to apply token colors */
  applyTokens?: boolean;
}

const DEFAULT_OPTIONS: ApplyThemeOptions = {
  target:         vscode.ConfigurationTarget.Global,
  applyWorkbench: true,
  applyTokens:    true,
}

/**
 * Apply a complete theme definition to VS Code.
 */
export async function applyThemeDefinition (
  theme: ThemeDefinition,
  options: Partial<ApplyThemeOptions> = {},
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const config = vscode.workspace.getConfiguration()
  const promises: PromiseLike<void>[] = []

  if (opts.applyWorkbench)
    promises.push(
      config.update(
        'workbench.colorCustomizations',
        theme.colors,
        opts.target,
      ),
    )

  if (opts.applyTokens)
    promises.push(
      config.update(
        'editor.tokenColorCustomizations',
        theme.tokenColors,
        opts.target,
      ),
    )

  await Promise.all(promises)
}

/**
 * Apply theme using the plugin framework.
 * This is the main entry point for applying themes.
 */
export async function applyTheme (
  settingsOrPalette: HueShiftSettings | ColorPalette,
  options: Partial<ApplyThemeOptions> = {},
): Promise<void> {
  let theme: ThemeDefinition

  if ('hue' in settingsOrPalette)
    theme = generateTheme(settingsOrPalette)
  else
    theme = paletteToTheme(settingsOrPalette)

  return applyThemeDefinition(theme, options)
}

/**
 * Convert a legacy ColorPalette to a ThemeDefinition.
 * Maintains backwards compatibility with the old API.
 */
export function paletteToTheme (palette: ColorPalette): ThemeDefinition {
  return {
    name:                 'Hue Shift (Legacy)',
    type:                 'dark',
    semanticHighlighting: true,
    colors:               {
      'editor.background':                  palette.background,
      'editor.foreground':                  palette.veryLightGray,
      'editor.selectionBackground':         palette.darkGray + '55',
      'editorCursor.foreground':            palette.primary,
      'editorLineNumber.foreground':        palette.gray,
      'editorLineNumber.activeForeground':  palette.lightGray,
      'editorGutter.background':            palette.background,
      'editorIndentGuide.background':       palette.darkGray,
      'editorIndentGuide.activeBackground': palette.gray,
      'editorBracketMatch.background':      palette.tertiary + '33',
      'editorBracketMatch.border':          palette.tertiary,
      'editorWhitespace.foreground':        palette.darkGray,
      'editorRuler.foreground':             palette.darkGray,
    },
    tokenColors: {
      textMateRules: [
        {
          scope:    [ 'comment', 'punctuation.definition.comment' ],
          settings: { foreground: palette.comment, fontStyle: 'italic' },
        },
        {
          scope:    [ 'string', 'string.quoted', 'string.template' ],
          settings: { foreground: palette.string },
        },
        {
          scope: [
            'keyword',
            'keyword.control',
            'keyword.operator.new',
            'storage.type',
            'storage.modifier',
          ],
          settings: { foreground: palette.keyword },
        },
        {
          scope: [
            'entity.name.function',
            'support.function',
            'meta.function-call.generic',
            'variable.function',
          ],
          settings: { foreground: palette.function },
        },
        {
          scope:    [ 'variable', 'variable.other.readwrite' ],
          settings: { foreground: palette.variable },
        },
        {
          scope:    [ 'variable.parameter' ],
          settings: { foreground: palette.parameter },
        },
        {
          scope: [
            'entity.name.type',
            'entity.name.class',
            'support.class',
            'support.type',
          ],
          settings: { foreground: palette.storage },
        },
        {
          scope:    [ 'constant.numeric', 'constant.language' ],
          settings: { foreground: palette.number },
        },
        {
          scope:    [ 'keyword.operator', 'punctuation.separator', 'punctuation.terminator' ],
          settings: { foreground: palette.operator },
        },
      ],
    },
  }
}

/**
 * Clear all theme customizations.
 */
export async function clearTheme (
  options: Partial<ApplyThemeOptions> = {},
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const config = vscode.workspace.getConfiguration()
  const promises: PromiseLike<void>[] = []

  if (opts.applyWorkbench)
    promises.push(
      config.update(
        'workbench.colorCustomizations',
        undefined,
        opts.target,
      ),
    )

  if (opts.applyTokens)
    promises.push(
      config.update(
        'editor.tokenColorCustomizations',
        undefined,
        opts.target,
      ),
    )

  await Promise.all(promises)
}

/**
 * Reapply the current theme based on cached settings.
 * Useful for refreshing the theme after a change.
 */
export async function reapplyTheme (
  options: Partial<ApplyThemeOptions> = {},
): Promise<void> {
  const cachedSettings = hueShiftPlugin.getCachedSettings()
  if (cachedSettings)
    await applyTheme(cachedSettings, options)
}

/**
 * Apply theme using the singleton plugin instance.
 * This is a convenience function for the most common use case.
 */
export async function applyCurrentTheme (
  options: Partial<ApplyThemeOptions> = {},
): Promise<void> {
  const settings = hueShiftPlugin.getCachedSettings() || {
    hue:             250,
    saturation:      70,
    luminance:       70,
    aberration:      60,
    drift:           30,
    backgroundLevel: 30,
    dimMinor:        40,
    tint:            '#808080',
    tintStrength:    0,
    brightness:      100,
    contrast:        100,
  }
  await applyTheme(settings, options)
}
