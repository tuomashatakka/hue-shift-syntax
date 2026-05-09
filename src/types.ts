/**
 * Settings for the Hue Shift plugin.
 * All values have defined ranges for validation.
 */
export interface HueShiftSettings {
  hue:             number; // 1–360, base hue for the color scheme
  saturation:      number; // 1–100, color vividness
  luminance:       number; // 30–100, base token brightness
  aberration:      number; // 15–165, hue offset for secondary/tertiary colors
  drift:           number; // 0–100, luminance variance across palette
  backgroundLevel: number; // 1–100, editor background brightness
  dimMinor:        number; // 10–90, muting strength for comments/strings
  tint:            string; // hex color, global tint overlay
  tintStrength:    number; // 0–95, how strongly tint blends into colors
  brightness:      number; // 60–200, token brightness multiplier
  contrast:        number; // 40–250, token contrast multiplier
}

/**
 * Default settings for the Hue Shift plugin.
 */
export const DEFAULT_SETTINGS: HueShiftSettings = {
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
} as const

/**
 * Valid ranges for each setting.
 * Used for validation and clamping.
 */
export interface SettingRanges {
  hue:             [number, number];
  saturation:      [number, number];
  luminance:       [number, number];
  aberration:      [number, number];
  drift:           [number, number];
  backgroundLevel: [number, number];
  dimMinor:        [number, number];
  tintStrength:    [number, number];
  brightness:      [number, number];
  contrast:        [number, number];
}

export const SETTING_RANGES: SettingRanges = {
  hue:             [ 1, 360 ],
  saturation:      [ 1, 100 ],
  luminance:       [ 30, 100 ],
  aberration:      [ 15, 165 ],
  drift:           [ 0, 100 ],
  backgroundLevel: [ 1, 100 ],
  dimMinor:        [ 10, 90 ],
  tintStrength:    [ 0, 95 ],
  brightness:      [ 60, 200 ],
  contrast:        [ 40, 250 ],
} as const

/**
 * Base color palette generated from HSL calculations.
 * These are the foundation colors before semantic mapping.
 */
export interface BasePalette {
  // Primary HSL-derived colors
  primary:   string;
  secondary: string;
  tertiary:  string;

  // Background color chain
  background:    string;
  veryLightGray: string;
  lightGray:     string;
  gray:          string;
  darkGray:      string;
  veryDarkGray:  string;

  // Raw unmixed colors (before tint application)
  rawPrimary:   string;
  rawSecondary: string;
  rawTertiary:  string;
}

/**
 * Semantic color roles for syntax highlighting.
 * Maps semantic meanings to actual colors.
 */
export interface SemanticColors {
  // Core syntax elements
  keyword:   string;
  storage:   string;
  string:    string;
  variable:  string;
  function:  string;
  comment:   string;
  parameter: string;
  operator:  string;
  number:    string;

  // Additional semantic roles (extendable)
  type:        string;
  class:       string;
  interface:   string;
  method:      string;
  property:    string;
  punctuation: string;
  constant:    string;
  tag:         string;
  attribute:   string;
}

/**
 * Workbench/editor UI colors.
 * Non-syntax colors for the editor chrome.
 */
export interface WorkbenchColors {
  'editor.background'?:                  string;
  'editor.foreground'?:                  string;
  'editorCursor.foreground'?:            string;
  'editorLineNumber.foreground'?:        string;
  'editorLineNumber.activeForeground'?:  string;
  'editorSelection.background'?:         string;
  'editorGutter.background'?:            string;
  'editorIndentGuide.background'?:       string;
  'editorIndentGuide.activeBackground'?: string;
  'editorBracketMatch.background'?:      string;
  'editorBracketMatch.border'?:          string;
  'editorWhitespace.foreground'?:        string;
  'editorRuler.foreground'?:             string;
  [key: string]:                         string | undefined;
}

/**
 * Token color rules for syntax highlighting.
 * Maps TextMate scopes to colors.
 */
export interface TokenColorRule {
  scope:    string | string[];
  settings: {
    foreground?: string;
    background?: string;
    fontStyle?:  string;
  };
}

/**
 * Complete token color customization structure.
 */
export interface TokenColors {
  textMateRules: TokenColorRule[];
}

/**
 * A complete theme definition.
 * Contains all colors needed for a VS Code theme or similar.
 */
export interface ThemeDefinition {
  name?:                 string;
  type?:                 'light' | 'dark' | 'hc';
  semanticHighlighting?: boolean;
  colors:                WorkbenchColors;
  tokenColors:           TokenColors;
  semanticTokenColors?:  Record<string, string>;
}

/**
 * The full color palette including all derived colors.
 * This is the complete output of the color calculation framework.
 */
export interface ColorPalette extends BasePalette, SemanticColors {
  // Retain existing properties for backwards compatibility
}

/**
 * Plugin interface for color calculation.
 * Defines the contract for the color calculation framework.
 */
export interface HueShiftPlugin {

  /** Unique identifier for this plugin */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Version of the plugin */
  readonly version: string;

  /**
   * Validate settings and clamp to valid ranges.
   */
  validateSettings(settings: Partial<HueShiftSettings>): HueShiftSettings;

  /**
   * Calculate the base color palette from settings.
   */
  calculateBasePalette(settings: HueShiftSettings): BasePalette;

  /**
   * Calculate semantic colors from the base palette.
   */
  calculateSemanticColors(base: BasePalette, settings: HueShiftSettings): SemanticColors;

  /**
   * Generate a complete theme definition.
   */
  generateTheme(settings: HueShiftSettings): ThemeDefinition;

  /**
   * Get the full color palette (base + semantic).
   */
  getPalette(settings: HueShiftSettings): ColorPalette;
}
