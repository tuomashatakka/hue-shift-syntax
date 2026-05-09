import {
  HueShiftSettings,
  HueShiftPlugin,
  ThemeDefinition,
  ColorPalette,
  BasePalette,
  SemanticColors,
  DEFAULT_SETTINGS,
} from './types'
import {
  validateSettings,
  calculateBasePalette,
  calculateSemanticColors,
  generateTheme,
  getPalette,
} from './ThemeGenerator'

/**
 * The main Hue Shift plugin implementation.
 * This is the framework for calculating all syntax theme colors based on settings.
 *
 * It provides a clean API that can be used independently of VS Code,
 * making it reusable for other editors or tools.
 */
export class HueShiftPluginImpl implements HueShiftPlugin {
  readonly id = 'hue-shift'
  readonly name = 'Hue Shift'
  readonly version = '2.0.0'

  private cachedTheme?:    ThemeDefinition
  private cachedSettings?: HueShiftSettings

  /**
   * Validate settings and clamp to valid ranges.
   */
  validateSettings (settings: Partial<HueShiftSettings>): HueShiftSettings {
    return validateSettings(settings)
  }

  /**
   * Calculate the base color palette from settings.
   */
  calculateBasePalette (settings: HueShiftSettings): BasePalette {
    return calculateBasePalette(settings)
  }

  /**
   * Calculate semantic colors from the base palette.
   */
  calculateSemanticColors (
    base: BasePalette,
    settings: HueShiftSettings,
  ): SemanticColors {
    return calculateSemanticColors(base, settings)
  }

  /**
   * Generate a complete theme definition.
   * Results are cached based on the last settings used.
   */
  generateTheme (settings: HueShiftSettings): ThemeDefinition {
    const validated = this.validateSettings(settings)

    // Return cached theme if settings haven't changed
    if (
      this.cachedTheme &&
      this.cachedSettings &&
      JSON.stringify(validated) === JSON.stringify(this.cachedSettings)
    )
      return this.cachedTheme

    this.cachedSettings = validated
    this.cachedTheme = generateTheme(validated)
    return this.cachedTheme
  }

  /**
   * Get the full color palette (base + semantic).
   */
  getPalette (settings: HueShiftSettings): ColorPalette {
    return getPalette(settings)
  }

  /**
   * Clear any cached theme data.
   */
  clearCache (): void {
    this.cachedTheme = undefined
    this.cachedSettings = undefined
  }

  /**
   * Get the current cached theme without recalculation.
   */
  getCachedTheme (): ThemeDefinition | undefined {
    return this.cachedTheme
  }

  /**
   * Get the current cached settings without recalculation.
   */
  getCachedSettings (): HueShiftSettings | undefined {
    return this.cachedSettings
  }

  /**
   * Create a theme with custom settings and a name.
   */
  createTheme (name: string, settings: Partial<HueShiftSettings>): ThemeDefinition {
    const fullSettings = this.validateSettings(settings)
    const theme = this.generateTheme(fullSettings)
    theme.name = name
    return theme
  }

  /**
   * Get the default theme.
   */
  getDefaultTheme (): ThemeDefinition {
    return this.generateTheme({ ...DEFAULT_SETTINGS })
  }
}

// Singleton instance for convenience
export const hueShiftPlugin = new HueShiftPluginImpl()

// Factory function for creating plugin instances
export function createHueShiftPlugin (): HueShiftPlugin {
  return new HueShiftPluginImpl()
}

// Export static utility functions for direct use
export {
  validateSettings,
  calculateBasePalette,
  calculateSemanticColors,
  generateTheme,
  getPalette,
} from './ThemeGenerator'
