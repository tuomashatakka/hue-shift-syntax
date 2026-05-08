/**
 * Hue Shift Syntax - Plugin Framework for Color Theme Generation
 * 
 * This module exports the complete plugin framework for calculating
 * syntax theme colors based on HSL color theory and extension settings.
 */

// Core color manipulation utilities
export {
  clamp,
  hslToHex,
  hexToRgb,
  hexToHsl,
  mixColors,
  lighten,
  darken,
  addHex,
  computePalette,
} from './ColorEngine'

// Types and interfaces
export type {
  HueShiftSettings,
  BasePalette,
  SemanticColors,
  ColorPalette,
  ThemeDefinition,
  WorkbenchColors,
  TokenColors,
  TokenColorRule,
  SettingRanges,
  HueShiftPlugin,
} from './types'

export {
  DEFAULT_SETTINGS,
  SETTING_RANGES,
} from './types'

// Theme generation framework
export {
  validateSettings,
  calculateBasePalette,
  calculateSemanticColors,
  generateTheme,
  getPalette,
  createNamedTheme,
} from './ThemeGenerator'

// Plugin implementation
export {
  HueShiftPluginImpl,
  hueShiftPlugin,
  createHueShiftPlugin,
} from './Plugin'

// Theme application (VS Code specific)
export {
  applyTheme,
  applyThemeDefinition,
  clearTheme,
  reapplyTheme,
  applyCurrentTheme,
  paletteToTheme,
}
from './ThemeApplicator'

export type { ApplyThemeOptions } from './ThemeApplicator'
