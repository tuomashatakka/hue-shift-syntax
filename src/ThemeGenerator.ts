/* eslint-disable complexity */
import { HueShiftSettings, BasePalette, SemanticColors, ColorPalette, ThemeDefinition, WorkbenchColors, TokenColors, TokenColorRule, DEFAULT_SETTINGS, SETTING_RANGES } from './types'


import { clamp, hslToHex, hexToHsl, mixColors, lighten, darken, addHex } from './ColorEngine'


export { DEFAULT_SETTINGS, SETTING_RANGES }

/**
 * Validates and clamps settings to their defined ranges.
 */
export function validateSettings (settings: Partial<HueShiftSettings>): HueShiftSettings {
  const result: HueShiftSettings = { ...DEFAULT_SETTINGS }

  // Clamp each numeric setting to its valid range
  const ranges = SETTING_RANGES

  if (typeof settings.hue === 'number')
    result.hue = clamp(settings.hue, ranges.hue[0], ranges.hue[1])
  if (typeof settings.saturation === 'number')
    result.saturation = clamp(settings.saturation, ranges.saturation[0], ranges.saturation[1])
  if (typeof settings.luminance === 'number')
    result.luminance = clamp(settings.luminance, ranges.luminance[0], ranges.luminance[1])
  if (typeof settings.aberration === 'number')
    result.aberration = clamp(settings.aberration, ranges.aberration[0], ranges.aberration[1])
  if (typeof settings.drift === 'number')
    result.drift = clamp(settings.drift, ranges.drift[0], ranges.drift[1])
  if (typeof settings.backgroundLevel === 'number')
    result.backgroundLevel = clamp(settings.backgroundLevel, ranges.backgroundLevel[0], ranges.backgroundLevel[1])
  if (typeof settings.dimMinor === 'number')
    result.dimMinor = clamp(settings.dimMinor, ranges.dimMinor[0], ranges.dimMinor[1])
  if (typeof settings.tintStrength === 'number')
    result.tintStrength = clamp(settings.tintStrength, ranges.tintStrength[0], ranges.tintStrength[1])
  if (typeof settings.brightness === 'number')
    result.brightness = clamp(settings.brightness, ranges.brightness[0], ranges.brightness[1])
  if (typeof settings.contrast === 'number')
    result.contrast = clamp(settings.contrast, ranges.contrast[0], ranges.contrast[1])

  // Handle tint - must be a valid hex color
  if (typeof settings.tint === 'string' && (/^#[0-9A-Fa-f]{6}$/).test(settings.tint))
    result.tint = settings.tint.toLowerCase()
  else if (typeof settings.tint === 'string' && (/^#[0-9A-Fa-f]{3}$/).test(settings.tint)) {
    // Expand shorthand hex
    const r = settings.tint[1]
    const g = settings.tint[2]
    const b = settings.tint[3]
    result.tint = `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  return result
}

/**
 * Calculate the base color palette from HSL settings.
 * This generates the foundation colors before semantic mapping.
 */
export function calculateBasePalette (settings: HueShiftSettings): BasePalette {
  const {
    hue,
    saturation,
    luminance,
    aberration,
    backgroundLevel,
    tint,
    tintStrength,
  } = settings

  const sat = saturation / 100
  const lum = luminance / 100
  const ts = tintStrength

  // Generate raw HSL colors
  const rawPrimary = hslToHex(hue, sat, lum)
  const rawSecondary = hslToHex(hue + aberration, sat, lum)
  const rawTertiary = hslToHex(hue - aberration, sat, lum)

  // Apply tint mixing
  const primary = mixColors(tint, rawPrimary, ts)
  const secondary = mixColors(tint, rawSecondary, ts)
  const tertiary = mixColors(tint, rawTertiary, ts)

  // Calculate foundation colors for background
  const foundationS = clamp((sat - 0.40) / 10, 0, 1)
  const foundationL = lum / 10
  const foundation = hslToHex(hue, foundationS, foundationL)

  const subtracted = darken(foundation, 2.4)
  const bgLifted = lighten(subtracted, backgroundLevel / 5)
  const [ bgH, bgS, bgL ] = hexToHsl(bgLifted)
  const bgColor = hslToHex(bgH, clamp(bgS + backgroundLevel / 2000, 0, 1), bgL)

  const [ bgH2, bgS2, bgL2 ] = hexToHsl(bgColor)
  const [ tintH, tintS ] = hexToHsl(tint)
  const tintHueInfluence = tintH * ts / 100
  const tintSatInfluence = tintS * ts / 100
  const background = hslToHex(
    (bgH2 + tintHueInfluence) / 2,
    (bgS2 + tintSatInfluence) / 2,
    bgL2 * 0.75,
  )

  // Generate grayscale from background
  const veryLightGray = mixColors(tint, lighten(background, 60), ts)
  const lightGray = mixColors(tint, lighten(background, 40), ts)
  const gray = mixColors(tint, lighten(background, 20), ts)
  const darkGray = mixColors(tint, background, ts)
  const veryDarkGray = mixColors(tint, darken(background, 15), ts)

  return {
    primary,
    secondary,
    tertiary,
    background,
    veryLightGray,
    lightGray,
    gray,
    darkGray,
    veryDarkGray,
    rawPrimary,
    rawSecondary,
    rawTertiary,
  }
}

/**
 * Calculate semantic colors from the base palette.
 * Maps semantic meanings (keyword, string, etc.) to actual colors.
 */
export function calculateSemanticColors (
  base: BasePalette,
  settings: HueShiftSettings,
): SemanticColors {
  const { dimMinor, tint, tintStrength } = settings
  const ts = tintStrength

  const lightenedPrimary = addHex(base.rawPrimary, '#777777')
  const blendBasis = mixColors(base.background, lightenedPrimary, dimMinor)

  const keyword = base.primary
  const storage = base.primary
  const string = mixColors(blendBasis, base.rawPrimary, 60)
  const variable = mixColors(blendBasis, base.rawTertiary, 40)
  const func = base.tertiary
  const comment = mixColors(base.background, base.gray, dimMinor)
  const parameter = base.secondary
  const number = base.tertiary
  const operator = mixColors(blendBasis, base.rawPrimary, 25)

  // Additional semantic colors
  const type = base.secondary
  const classColor = mixColors(blendBasis, base.rawSecondary, 50)
  const interfaceColor = mixColors(blendBasis, base.rawTertiary, 60)
  const method = mixColors(blendBasis, base.rawSecondary, 40)
  const property = mixColors(blendBasis, base.rawPrimary, 35)
  const punctuation = base.gray
  const constant = mixColors(blendBasis, base.rawPrimary, 70)
  const tag = base.secondary
  const attribute = mixColors(blendBasis, base.rawSecondary, 30)

  return {
    keyword,
    storage,
    string,
    variable,
    function:  func,
    comment,
    parameter,
    operator,
    number,
    type,
    class:     classColor,
    interface: interfaceColor,
    method,
    property,
    punctuation,
    constant,
    tag,
    attribute,
  }
}

/**
 * Build workbench colors from the base palette.
 */
function buildWorkbenchColors (base: BasePalette): WorkbenchColors {
  return {
    'editor.background':                       base.background,
    'editor.foreground':                       base.veryLightGray,
    'editor.selectionBackground':              base.darkGray + '55',
    'editorCursor.foreground':                 base.primary,
    'editorLineNumber.foreground':             base.gray,
    'editorLineNumber.activeForeground':       base.lightGray,
    'editorGutter.background':                 base.background,
    'editorIndentGuide.background':            base.darkGray,
    'editorIndentGuide.activeBackground':      base.gray,
    'editorBracketMatch.background':           base.tertiary + '33',
    'editorBracketMatch.border':               base.tertiary,
    'editorWhitespace.foreground':             base.darkGray,
    'editorRuler.foreground':                  base.darkGray,
    'editorError.foreground':                  base.rawPrimary,
    'editorWarning.foreground':                base.rawSecondary,
    'editorInfo.foreground':                   base.rawTertiary,
    'scrollbarSlider.background':              base.darkGray + '80',
    'scrollbarSlider.hoverBackground':         base.gray + '80',
    'scrollbarSlider.activeBackground':        base.lightGray + '80',
    'tab.activeBackground':                    base.background,
    'tab.activeForeground':                    base.veryLightGray,
    'tab.inactiveBackground':                  base.darkGray,
    'tab.inactiveForeground':                  base.gray,
    'tab.border':                              base.darkGray,
    'tab.activeBorder':                        base.primary,
    'activityBar.background':                  base.background,
    'activityBar.foreground':                  base.veryLightGray,
    'activityBarBadge.background':             base.primary,
    'activityBarBadge.foreground':             base.background,
    'sideBar.background':                      base.background,
    'sideBar.foreground':                      base.veryLightGray,
    'sideBarSectionHeader.background':         base.darkGray,
    'statusBar.background':                    base.background,
    'statusBar.foreground':                    base.veryLightGray,
    'statusBar.debuggingBackground':           base.secondary,
    'statusBar.debuggingForeground':           base.background,
    'badge.background':                        base.primary,
    'badge.foreground':                        base.background,
    'button.background':                       base.primary,
    'button.foreground':                       base.background,
    'button.hoverBackground':                  base.secondary,
    'dropdown.background':                     base.darkGray,
    'dropdown.foreground':                     base.veryLightGray,
    'input.background':                        base.darkGray,
    'input.foreground':                        base.veryLightGray,
    'input.placeholderForeground':             base.gray,
    'list.activeSelectionBackground':          base.primary + '33',
    'list.activeSelectionForeground':          base.veryLightGray,
    'list.focusBackground':                    base.darkGray,
    'list.hoverBackground':                    base.gray + '33',
    'list.inactiveSelectionBackground':        base.gray + '33',
    'list.highlightForeground':                base.primary,
    'editorSuggestWidget.background':          base.background,
    'editorSuggestWidget.foreground':          base.veryLightGray,
    'editorSuggestWidget.highlightForeground': base.primary,
    'peekViewEditor.background':               base.background,
    'peekViewResult.background':               base.background,
    'peekViewTitle.background':                base.darkGray,
    'peekViewEditorGutter.background':         base.background,
    'peekViewResult.matchHighlightBackground': base.primary + '33',
  }
}

/**
 * Build token color rules from semantic colors.
 */
function buildTokenColors (semantic: SemanticColors): TokenColors {
  const rules: TokenColorRule[] = [
    // Comments
    {
      scope:    [ 'comment', 'punctuation.definition.comment' ],
      settings: { foreground: semantic.comment, fontStyle: 'italic' },
    },

    // Strings
    {
      scope:    [ 'string', 'string.quoted', 'string.template', 'string.regexp' ],
      settings: { foreground: semantic.string },
    },

    // Keywords
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.delete',
        'keyword.operator instanceof',
        'keyword.operator typeof',
      ],
      settings: { foreground: semantic.keyword },
    },

    // Storage types
    {
      scope:    [ 'storage.type', 'storage.modifier', 'storage.class' ],
      settings: { foreground: semantic.storage },
    },

    // Functions
    {
      scope: [
        'entity.name.function',
        'support.function',
        'meta.function-call.generic',
        'variable.function',
      ],
      settings: { foreground: semantic.function },
    },

    // Variables
    {
      scope:    [ 'variable', 'variable.other.readwrite', 'meta.variable' ],
      settings: { foreground: semantic.variable },
    },

    // Parameters
    {
      scope:    [ 'variable.parameter', 'meta.parameter' ],
      settings: { foreground: semantic.parameter },
    },

    // Types and classes
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'support.class',
        'support.type',
        'meta.class',
      ],
      settings: { foreground: semantic.type },
    },

    // Interfaces
    {
      scope:    [ 'support.interface', 'entity.other.inherited-class' ],
      settings: { foreground: semantic.interface },
    },

    // Methods
    {
      scope:    [ 'entity.name.method', 'meta.method-call' ],
      settings: { foreground: semantic.method },
    },

    // Properties
    {
      scope:    [ 'entity.other.attribute-name', 'meta.object-literal.key' ],
      settings: { foreground: semantic.property },
    },

    // Numbers
    {
      scope:    [ 'constant.numeric', 'constant.language' ],
      settings: { foreground: semantic.number },
    },

    // Constants
    {
      scope:    [ 'constant.other', 'variable.other.constant' ],
      settings: { foreground: semantic.constant },
    },

    // Operators and punctuation
    {
      scope: [
        'keyword.operator',
        'punctuation.separator',
        'punctuation.terminator',
        'punctuation.definition.parameters',
        'punctuation.definition.block',
        'punctuation.accessor',
      ],
      settings: { foreground: semantic.operator },
    },

    // Tags (HTML/XML)
    {
      scope:    [ 'entity.name.tag', 'meta.tag' ],
      settings: { foreground: semantic.tag },
    },

    // Attributes (HTML/XML)
    {
      scope:    [ 'entity.other.attribute-name', 'meta.attribute' ],
      settings: { foreground: semantic.attribute },
    },

    // Punctuation
    {
      scope:    [ 'punctuation' ],
      settings: { foreground: semantic.punctuation },
    },
  ]

  return { textMateRules: rules }
}

/**
 * Generate a complete theme definition from settings.
 */
export function generateTheme (settings: HueShiftSettings): ThemeDefinition {
  const validated = validateSettings(settings)
  const base = calculateBasePalette(validated)
  const semantic = calculateSemanticColors(base, validated)

  // Determine theme type based on background luminance
  const [ , , bgL ] = hexToHsl(base.background)
  const type: 'light' | 'dark' | 'hc' = bgL < 0.5 ? 'dark' : 'light'

  return {
    name:                 'Hue Shift',
    type,
    semanticHighlighting: true,
    colors:               buildWorkbenchColors(base),
    tokenColors:          buildTokenColors(semantic),
  }
}

/**
 * Get the full color palette (base + semantic) from settings.
 * This is the complete output combining all calculated colors.
 */
export function getPalette (settings: HueShiftSettings): ColorPalette {
  const validated = validateSettings(settings)
  const base = calculateBasePalette(validated)
  const semantic = calculateSemanticColors(base, validated)

  return {
    ...base,
    ...semantic,
  }
}

/**
 * Create a pre-configured theme with a name.
 */
export function createNamedTheme (
  name: string,
  settings: Partial<HueShiftSettings>,
): ThemeDefinition {
  const fullSettings = validateSettings(settings)
  const theme = generateTheme(fullSettings)
  theme.name = name
  return theme
}

// Re-export computePalette for backwards compatibility
import { computePalette as legacyComputePalette } from './ColorEngine'


export { legacyComputePalette as computePalette }
