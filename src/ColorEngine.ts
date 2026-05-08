import { HueShiftSettings, ColorPalette } from './types'


export function clamp (val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

export function hslToHex (h: number, s: number, l: number): string {
  h = (h % 360 + 360) % 360 // normalize to 0–360

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(h / 60 % 2 - 1))
  const m = l - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c; g = x; b = 0
  }
  else if (h < 120) {
    r = x; g = c; b = 0
  }
  else if (h < 180) {
    r = 0; g = c; b = x
  }
  else if (h < 240) {
    r = 0; g = x; b = c
  }
  else if (h < 300) {
    r = x; g = 0; b = c
  }
  else {
    r = c; g = 0; b = x
  }

  const toHex = (n: number) =>
    Math.round(clamp((n + m) * 255, 0, 255)).toString(16)
      .padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgb (hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function rgbToHsl (r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min)
    return [ 0, 0, l ]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    case b: h = ((r - g) / d + 4) / 6; break
  }
  return [ h * 360, s, l ]
}

export function hexToHsl (hex: string): [number, number, number] {
  return rgbToHsl(...hexToRgb(hex))
}

/** weight: 0–100. 100 = all hex1, 0 = all hex2. Matches Less mix() semantics. */
export function mixColors (hex1: string, hex2: string, weight: number): string {
  const w = clamp(weight, 0, 100) / 100
  const [ r1, g1, b1 ] = hexToRgb(hex1)
  const [ r2, g2, b2 ] = hexToRgb(hex2)
  const r = Math.round(r1 * w + r2 * (1 - w))
  const g = Math.round(g1 * w + g2 * (1 - w))
  const b = Math.round(b1 * w + b2 * (1 - w))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/** amount: percentage points added to HSL lightness (0–100). */
export function lighten (hex: string, amount: number): string {
  const [ h, s, l ] = hexToHsl(hex)
  return hslToHex(h, s, clamp(l + amount / 100, 0, 1))
}

export function darken (hex: string, amount: number): string {
  const [ h, s, l ] = hexToHsl(hex)
  return hslToHex(h, s, clamp(l - amount / 100, 0, 1))
}

/** Component-wise addition, clamped to 0–255 per channel. Mirrors Less + operator. */
export function addHex (hex1: string, hex2: string): string {
  const [ r1, g1, b1 ] = hexToRgb(hex1)
  const [ r2, g2, b2 ] = hexToRgb(hex2)
  const r = clamp(r1 + r2, 0, 255)
  const g = clamp(g1 + g2, 0, 255)
  const b = clamp(b1 + b2, 0, 255)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export function computePalette (settings: HueShiftSettings): ColorPalette {
  const { hue, saturation, luminance, aberration, backgroundLevel, dimMinor, tint, tintStrength } = settings

  const sat = saturation / 100
  const lum = luminance / 100
  const ts = tintStrength

  const rawPrimary   = hslToHex(hue, sat, lum)
  const rawSecondary = hslToHex(hue + aberration, sat, lum)
  const rawTertiary  = hslToHex(hue - aberration, sat, lum)

  const primary   = mixColors(tint, rawPrimary, ts)
  const secondary = mixColors(tint, rawSecondary, ts)
  const tertiary  = mixColors(tint, rawTertiary, ts)

  const foundationS = clamp((sat - 0.40) / 10, 0, 1)
  const foundationL = lum / 10
  const foundation  = hslToHex(hue, foundationS, foundationL)

  const subtracted        = darken(foundation, 2.4)
  const bgLifted          = lighten(subtracted, backgroundLevel / 5)
  const [ bgH, bgS, bgL ] = hexToHsl(bgLifted)
  const bgColor           = hslToHex(bgH, clamp(bgS + backgroundLevel / 2000, 0, 1), bgL)

  const [ bgH2, bgS2, bgL2 ] = hexToHsl(bgColor)
  const [ tintH, tintS ]     = hexToHsl(tint)
  const tintHueInfluence     = tintH * ts / 100
  const tintSatInfluence     = tintS * ts / 100
  const background           = hslToHex((bgH2 + tintHueInfluence) / 2, (bgS2 + tintSatInfluence) / 2, bgL2 * 0.75)

  const veryLightGray = mixColors(tint, lighten(background, 60), ts)
  const lightGray     = mixColors(tint, lighten(background, 40), ts)
  const gray          = mixColors(tint, lighten(background, 20), ts)
  const darkGray      = mixColors(tint, background, ts)
  const veryDarkGray  = mixColors(tint, darken(background, 15), ts)

  const lightenedPrimary = addHex(rawPrimary, '#777777')
  const blendBasis       = mixColors(background, lightenedPrimary, dimMinor)

  const keyword = primary
  const storage = primary
  const string = mixColors(blendBasis, rawPrimary, 60)
  const variable = mixColors(blendBasis, rawTertiary, 40)
  const func = tertiary
  const comment = mixColors(background, gray, dimMinor)
  const parameter = secondary
  const number = tertiary
  const operator = mixColors(blendBasis, rawPrimary, 25)

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
    keyword,
    string,
    variable,
    function: func,
    comment,
    storage,
    parameter,
    operator,
    number,
    type: secondary,
    class: mixColors(blendBasis, rawSecondary, 50),
    interface: mixColors(blendBasis, rawTertiary, 60),
    method: mixColors(blendBasis, rawSecondary, 40),
    property: mixColors(blendBasis, rawPrimary, 35),
    punctuation: gray,
    constant: mixColors(blendBasis, rawPrimary, 70),
    tag: secondary,
    attribute: mixColors(blendBasis, rawSecondary, 30),
  }
}
