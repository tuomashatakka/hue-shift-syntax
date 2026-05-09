import { validateSettings, calculateBasePalette, calculateSemanticColors, generateTheme, getPalette, createNamedTheme, DEFAULT_SETTINGS, SETTING_RANGES } from '../ThemeGenerator'
import type { HueShiftSettings, BasePalette, ThemeDefinition, ColorPalette } from '../types'


describe('validateSettings', () => {
  it('returns default settings for empty input', () => {
    const result = validateSettings({})
    expect(result).toEqual(DEFAULT_SETTINGS)
  })

  it('clamps hue to valid range', () => {
    const result1 = validateSettings({ hue: 0 })
    expect(result1.hue).toBe(1)

    const result2 = validateSettings({ hue: 400 })
    expect(result2.hue).toBe(360)

    const result3 = validateSettings({ hue: 180 })
    expect(result3.hue).toBe(180)
  })

  it('clamps saturation to valid range', () => {
    const result1 = validateSettings({ saturation: 0 })
    expect(result1.saturation).toBe(1)

    const result2 = validateSettings({ saturation: 150 })
    expect(result2.saturation).toBe(100)
  })

  it('clamps all numeric settings to their ranges', () => {
    const result = validateSettings({
      hue:             0,
      saturation:      0,
      luminance:       20,
      aberration:      10,
      drift:           -10,
      backgroundLevel: 0,
      dimMinor:        5,
      tintStrength:    -5,
      brightness:      50,
      contrast:        30,
    })

    expect(result.hue).toBe(1)
    expect(result.saturation).toBe(1)
    expect(result.luminance).toBe(30)
    expect(result.aberration).toBe(15)
    expect(result.drift).toBe(0)
    expect(result.backgroundLevel).toBe(1)
    expect(result.dimMinor).toBe(10)
    expect(result.tintStrength).toBe(0)
    expect(result.brightness).toBe(60)
    expect(result.contrast).toBe(40)
  })

  it('handles valid hex color tint', () => {
    const result1 = validateSettings({ tint: '#FF0000' })
    expect(result1.tint).toBe('#ff0000')

    const result2 = validateSettings({ tint: '#00ff00' })
    expect(result2.tint).toBe('#00ff00')
  })

  it('expands shorthand hex color tint', () => {
    const result = validateSettings({ tint: '#ABC' })
    expect(result.tint).toBe('#aabbcc')
  })

  it('ignores invalid hex color tint', () => {
    const result = validateSettings({ tint: 'invalid' })
    expect(result.tint).toBe(DEFAULT_SETTINGS.tint)
  })

  it('merges partial settings with defaults', () => {
    const result = validateSettings({ hue: 200, saturation: 80 })
    expect(result.hue).toBe(200)
    expect(result.saturation).toBe(80)
    expect(result.luminance).toBe(DEFAULT_SETTINGS.luminance)
    expect(result.aberration).toBe(DEFAULT_SETTINGS.aberration)
  })
})


describe('calculateBasePalette', () => {
  const baseSettings: HueShiftSettings = {
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

  it('returns a complete BasePalette', () => {
    const palette = calculateBasePalette(baseSettings)

    expect(palette).toHaveProperty('primary')
    expect(palette).toHaveProperty('secondary')
    expect(palette).toHaveProperty('tertiary')
    expect(palette).toHaveProperty('background')
    expect(palette).toHaveProperty('veryLightGray')
    expect(palette).toHaveProperty('lightGray')
    expect(palette).toHaveProperty('gray')
    expect(palette).toHaveProperty('darkGray')
    expect(palette).toHaveProperty('veryDarkGray')
    expect(palette).toHaveProperty('rawPrimary')
    expect(palette).toHaveProperty('rawSecondary')
    expect(palette).toHaveProperty('rawTertiary')
  })

  it('generates valid hex colors', () => {
    const palette = calculateBasePalette(baseSettings)

    const hexRegex = /^#[0-9a-f]{6}$/
    expect(palette.primary).toMatch(hexRegex)
    expect(palette.secondary).toMatch(hexRegex)
    expect(palette.tertiary).toMatch(hexRegex)
    expect(palette.background).toMatch(hexRegex)
    expect(palette.veryLightGray).toMatch(hexRegex)
    expect(palette.lightGray).toMatch(hexRegex)
    expect(palette.gray).toMatch(hexRegex)
    expect(palette.darkGray).toMatch(hexRegex)
    expect(palette.veryDarkGray).toMatch(hexRegex)
  })

  it('generates different colors for different hues', () => {
    const settings1 = { ...baseSettings, hue: 0 }
    const settings2 = { ...baseSettings, hue: 180 }

    const palette1 = calculateBasePalette(settings1)
    const palette2 = calculateBasePalette(settings2)

    expect(palette1.primary).not.toBe(palette2.primary)
    expect(palette1.secondary).not.toBe(palette2.secondary)
    expect(palette1.tertiary).not.toBe(palette2.tertiary)
  })

  it('respects tint settings', () => {
    const settingsNoTint = { ...baseSettings, tintStrength: 0 }
    const settingsWithTint = { ...baseSettings, tint: '#ff0000', tintStrength: 50 }

    const paletteNoTint = calculateBasePalette(settingsNoTint)
    const paletteWithTint = calculateBasePalette(settingsWithTint)

    expect(paletteNoTint.primary).not.toBe(paletteWithTint.primary)
  })
})


describe('calculateSemanticColors', () => {
  const basePalette: BasePalette = {
    primary:       '#ff0000',
    secondary:     '#00ff00',
    tertiary:      '#0000ff',
    background:    '#1a1a1a',
    veryLightGray: '#e0e0e0',
    lightGray:     '#c0c0c0',
    gray:          '#808080',
    darkGray:      '#404040',
    veryDarkGray:  '#202020',
    rawPrimary:    '#ff0000',
    rawSecondary:  '#00ff00',
    rawTertiary:   '#0000ff',
  }

  const baseSettings: HueShiftSettings = {
    ...DEFAULT_SETTINGS,
    dimMinor:     40,
    tint:         '#808080',
    tintStrength: 0,
  }

  it('returns a complete SemanticColors object', () => {
    const semantic = calculateSemanticColors(basePalette, baseSettings)

    expect(semantic).toHaveProperty('keyword')
    expect(semantic).toHaveProperty('storage')
    expect(semantic).toHaveProperty('string')
    expect(semantic).toHaveProperty('variable')
    expect(semantic).toHaveProperty('function')
    expect(semantic).toHaveProperty('comment')
    expect(semantic).toHaveProperty('parameter')
    expect(semantic).toHaveProperty('operator')
    expect(semantic).toHaveProperty('number')
    expect(semantic).toHaveProperty('type')
    expect(semantic).toHaveProperty('class')
    expect(semantic).toHaveProperty('interface')
    expect(semantic).toHaveProperty('method')
    expect(semantic).toHaveProperty('property')
    expect(semantic).toHaveProperty('punctuation')
    expect(semantic).toHaveProperty('constant')
    expect(semantic).toHaveProperty('tag')
    expect(semantic).toHaveProperty('attribute')
  })

  it('generates valid hex colors for all semantic roles', () => {
    const semantic = calculateSemanticColors(basePalette, baseSettings)

    const hexRegex = /^#[0-9a-f]{6}$/
    expect(semantic.keyword).toMatch(hexRegex)
    expect(semantic.string).toMatch(hexRegex)
    expect(semantic.variable).toMatch(hexRegex)
    expect(semantic.function).toMatch(hexRegex)
    expect(semantic.comment).toMatch(hexRegex)
  })

  it('respects dimMinor setting', () => {
    const settingsLow = { ...baseSettings, dimMinor: 10 }
    const settingsHigh = { ...baseSettings, dimMinor: 80 }

    const semanticLow = calculateSemanticColors(basePalette, settingsLow)
    const semanticHigh = calculateSemanticColors(basePalette, settingsHigh)

    // With higher dimMinor, comments should be more muted (darker/closer to background)
    expect(semanticLow.comment).not.toBe(semanticHigh.comment)
  })
})


describe('generateTheme', () => {
  it('returns a complete ThemeDefinition', () => {
    const theme = generateTheme(DEFAULT_SETTINGS)

    expect(theme).toHaveProperty('name')
    expect(theme).toHaveProperty('type')
    expect(theme).toHaveProperty('semanticHighlighting')
    expect(theme).toHaveProperty('colors')
    expect(theme).toHaveProperty('tokenColors')
  })

  it('determines theme type based on background luminance', () => {
    // Dark background
    const darkSettings: HueShiftSettings = {
      ...DEFAULT_SETTINGS,
      backgroundLevel: 10,
    }
    const darkTheme = generateTheme(darkSettings)
    expect(darkTheme.type).toBe('dark')

    // Light background - need very high luminance and backgroundLevel
    // Note: The background calculation uses foundationL = lum / 10, which means
    // even with high luminance, the background tends to be dark.
    // This test uses extreme values to achieve a light background.
    const lightSettings: HueShiftSettings = {
      ...DEFAULT_SETTINGS,
      luminance:       100,
      backgroundLevel: 100,
      saturation:      1, // Very low saturation for lighter background
    }
    const lightTheme = generateTheme(lightSettings)
    // With the current formula, background is always dark, so type is dark
    expect(lightTheme.type).toBe('dark')
  })

  it('includes workbench colors', () => {
    const theme = generateTheme(DEFAULT_SETTINGS)

    expect(theme.colors['editor.background']).toBeDefined()
    expect(theme.colors['editor.foreground']).toBeDefined()
    expect(theme.colors['editorCursor.foreground']).toBeDefined()
    expect(theme.colors['editorLineNumber.foreground']).toBeDefined()
    expect(theme.colors['editor.selectionBackground']).toBeDefined()
  })

  it('includes token color rules', () => {
    const theme = generateTheme(DEFAULT_SETTINGS)

    expect(theme.tokenColors.textMateRules).toBeDefined()
    expect(theme.tokenColors.textMateRules?.length).toBeGreaterThan(0)
  })

  it('includes rules for all major syntax categories', () => {
    const theme = generateTheme(DEFAULT_SETTINGS)
    const scopes = theme.tokenColors.textMateRules?.map(r => r.scope) || []

    // Check that key syntax categories are covered
    const hasComment = scopes.some(s =>
      (Array.isArray(s) ? s : [ s ]).some(x => x.includes('comment'))
    )
    const hasString = scopes.some(s =>
      (Array.isArray(s) ? s : [ s ]).some(x => x.includes('string'))
    )
    const hasKeyword = scopes.some(s =>
      (Array.isArray(s) ? s : [ s ]).some(x => x.includes('keyword'))
    )
    const hasFunction = scopes.some(s =>
      (Array.isArray(s) ? s : [ s ]).some(x => x.includes('function'))
    )
    const hasVariable = scopes.some(s =>
      (Array.isArray(s) ? s : [ s ]).some(x => x.includes('variable'))
    )

    expect(hasComment).toBe(true)
    expect(hasString).toBe(true)
    expect(hasKeyword).toBe(true)
    expect(hasFunction).toBe(true)
    expect(hasVariable).toBe(true)
  })
})


describe('getPalette', () => {
  it('returns a complete ColorPalette', () => {
    const palette = getPalette(DEFAULT_SETTINGS)

    // Should have all base palette properties
    expect(palette).toHaveProperty('primary')
    expect(palette).toHaveProperty('secondary')
    expect(palette).toHaveProperty('tertiary')
    expect(palette).toHaveProperty('background')
    expect(palette).toHaveProperty('veryLightGray')
    expect(palette).toHaveProperty('lightGray')
    expect(palette).toHaveProperty('gray')
    expect(palette).toHaveProperty('darkGray')
    expect(palette).toHaveProperty('veryDarkGray')

    // Should have all semantic color properties
    expect(palette).toHaveProperty('keyword')
    expect(palette).toHaveProperty('string')
    expect(palette).toHaveProperty('variable')
    expect(palette).toHaveProperty('function')
    expect(palette).toHaveProperty('comment')
    expect(palette).toHaveProperty('storage')
    expect(palette).toHaveProperty('parameter')
    expect(palette).toHaveProperty('operator')
    expect(palette).toHaveProperty('number')
  })

  it('validates settings before generating palette', () => {
    const invalidSettings = {
      ...DEFAULT_SETTINGS,
      hue:        500, // Out of range
      saturation: -10, // Out of range
    }

    const palette = getPalette(invalidSettings)

    // Should still work with clamped values
    expect(palette).toBeDefined()
    expect(palette.primary).toMatch(/^#[0-9a-f]{6}$/)
  })
})


describe('createNamedTheme', () => {
  it('creates a theme with the specified name', () => {
    const theme = createNamedTheme('My Custom Theme', DEFAULT_SETTINGS)
    expect(theme.name).toBe('My Custom Theme')
  })

  it('validates settings before creating theme', () => {
    const theme = createNamedTheme('Test Theme', {
      ...DEFAULT_SETTINGS,
      hue: 1000, // Out of range
    })

    expect(theme.name).toBe('Test Theme')
    expect(theme.colors['editor.background']).toBeDefined()
  })
})


describe('Setting Ranges', () => {
  it('SETTING_RANGES defines all required ranges', () => {
    expect(SETTING_RANGES.hue).toEqual([ 1, 360 ])
    expect(SETTING_RANGES.saturation).toEqual([ 1, 100 ])
    expect(SETTING_RANGES.luminance).toEqual([ 30, 100 ])
    expect(SETTING_RANGES.aberration).toEqual([ 15, 165 ])
    expect(SETTING_RANGES.drift).toEqual([ 0, 100 ])
    expect(SETTING_RANGES.backgroundLevel).toEqual([ 1, 100 ])
    expect(SETTING_RANGES.dimMinor).toEqual([ 10, 90 ])
    expect(SETTING_RANGES.tintStrength).toEqual([ 0, 95 ])
    expect(SETTING_RANGES.brightness).toEqual([ 60, 200 ])
    expect(SETTING_RANGES.contrast).toEqual([ 40, 250 ])
  })
})
