# VS Code Extension Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Atom syntax theme package with a TypeScript VS Code extension that computes an HSL-based color palette from user settings and applies it live via `workbench.colorCustomizations` and `editor.tokenColorCustomizations`.

**Architecture:** `ColorEngine.ts` (pure HSL math, zero VS Code deps) computes a `ColorPalette` from `HueShiftSettings`. `ThemeApplicator.ts` writes that palette to VS Code's global configuration. `extension.ts` registers an `onDidChangeConfiguration` listener and wires the two together.

**Tech Stack:** TypeScript 5, VS Code Extension API (^1.85), Jest + ts-jest for unit tests, no runtime dependencies.

---

## Task 1: Clean Atom artifacts and scaffold extension

**Files:**
- Delete: `lib/`, `styles/`, `conf/`, `keymaps/`, `menus/`, `spec/`, `fixtures/`, `index.less`, `pigments-report.json`, `_config.yml`
- Create: `package.json`, `tsconfig.json`, `jest.config.js`, `.vscodeignore`, `src/` (empty dir)

**Step 1: Remove all Atom-specific files**

```bash
rm -rf lib styles conf keymaps menus spec fixtures
rm -f index.less pigments-report.json _config.yml
```

**Step 2: Replace package.json**

```json
{
  "name": "hue-shift-syntax",
  "displayName": "Hue Shift Syntax",
  "description": "Configurable syntax colors driven by HSL color theory",
  "version": "1.0.0",
  "publisher": "tuomashatakka",
  "engines": { "vscode": "^1.85.0" },
  "categories": ["Themes"],
  "keywords": ["syntax", "theme", "hue", "configurable", "colorful"],
  "repository": "https://github.com/tuomashatakka/hue-shift-syntax",
  "license": "MIT",
  "main": "./out/extension.js",
  "activationEvents": ["onStartupFinished"],
  "contributes": {
    "configuration": {
      "title": "Hue Shift",
      "properties": {
        "hueShift.hue": {
          "type": "number", "default": 250, "minimum": 1, "maximum": 360,
          "description": "Base hue for the syntax theme (0–360 degrees on the color wheel)"
        },
        "hueShift.saturation": {
          "type": "number", "default": 70, "minimum": 1, "maximum": 100,
          "description": "Color vividness"
        },
        "hueShift.luminance": {
          "type": "number", "default": 70, "minimum": 30, "maximum": 100,
          "description": "Token brightness"
        },
        "hueShift.aberration": {
          "type": "number", "default": 60, "minimum": 15, "maximum": 165,
          "description": "Hue offset between primary and secondary/tertiary colors"
        },
        "hueShift.drift": {
          "type": "number", "default": 30, "minimum": 0, "maximum": 100,
          "description": "Luminance variance across palette colors"
        },
        "hueShift.backgroundLevel": {
          "type": "number", "default": 30, "minimum": 1, "maximum": 100,
          "description": "Editor background brightness"
        },
        "hueShift.dimMinor": {
          "type": "number", "default": 40, "minimum": 10, "maximum": 90,
          "description": "Muting strength for comments and strings"
        },
        "hueShift.tint": {
          "type": "string", "default": "#808080",
          "description": "Global tint color (hex)"
        },
        "hueShift.tintStrength": {
          "type": "number", "default": 0, "minimum": 0, "maximum": 95,
          "description": "How strongly the tint blends into all colors (0 = none)"
        },
        "hueShift.brightness": {
          "type": "number", "default": 100, "minimum": 60, "maximum": 200,
          "description": "Token brightness multiplier (applied as HSL lightness offset)"
        },
        "hueShift.contrast": {
          "type": "number", "default": 100, "minimum": 40, "maximum": 250,
          "description": "Token contrast multiplier (applied as saturation offset)"
        }
      }
    }
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "test": "jest"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.85.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.3.0"
  }
}
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"],
  "exclude": ["node_modules", ".vscode-test", "out"]
}
```

**Step 4: Create jest.config.js**

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^vscode$': '<rootDir>/src/__mocks__/vscode.ts'
  }
};
```

**Step 5: Create .vscodeignore**

```
.vscode/**
src/**
out/test/**
.gitignore
tsconfig.json
jest.config.js
docs/**
```

**Step 6: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

**Step 7: Commit**

```bash
git add package.json tsconfig.json jest.config.js .vscodeignore
git commit -m "feat: scaffold VS Code extension, remove Atom artifacts"
```

---

## Task 2: Define TypeScript interfaces

**Files:**
- Create: `src/types.ts`

**Step 1: Write src/types.ts**

```typescript
export interface HueShiftSettings {
  hue: number;           // 1–360
  saturation: number;    // 1–100
  luminance: number;     // 30–100
  aberration: number;    // 15–165, hue offset for secondary/tertiary
  drift: number;         // 0–100, luminance variance
  backgroundLevel: number; // 1–100
  dimMinor: number;      // 10–90, muting for comments/strings
  tint: string;          // hex color
  tintStrength: number;  // 0–95
  brightness: number;    // 60–200
  contrast: number;      // 40–250
}

export interface ColorPalette {
  // HSL-derived base
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  // Gray scale (derived from background)
  veryLightGray: string;
  lightGray: string;
  gray: string;
  darkGray: string;
  veryDarkGray: string;
  // Semantic token roles
  keyword: string;
  string: string;
  variable: string;
  function: string;
  comment: string;
  storage: string;
  parameter: string;
  operator: string;
  number: string;
}
```

**Step 2: Compile to check types**

```bash
npx tsc --noEmit
```

Expected: No errors (only `src/types.ts` exists so far, no imports to fail).

**Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add HueShiftSettings and ColorPalette interfaces"
```

---

## Task 3: Color math helpers — conversion functions (TDD)

**Files:**
- Create: `src/__tests__/ColorEngine.test.ts` (test first)
- Create: `src/ColorEngine.ts` (implement after)

**Step 1: Create the VS Code mock (required by jest.config moduleNameMapper)**

```typescript
// src/__mocks__/vscode.ts
export const workspace = {
  getConfiguration: jest.fn(),
  onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() })),
};
export const ConfigurationTarget = { Global: 1, Workspace: 2, WorkspaceFolder: 3 };
```

**Step 2: Write failing tests for hslToHex, hexToRgb, hexToHsl**

```typescript
// src/__tests__/ColorEngine.test.ts
import { hslToHex, hexToRgb, hexToHsl, clamp } from '../ColorEngine';

describe('clamp', () => {
  it('clamps below min', () => expect(clamp(-5, 0, 100)).toBe(0));
  it('clamps above max', () => expect(clamp(200, 0, 100)).toBe(100));
  it('passes through in-range values', () => expect(clamp(50, 0, 100)).toBe(50));
});

describe('hslToHex', () => {
  it('converts red (0, 1, 0.5)', () => {
    expect(hslToHex(0, 1, 0.5)).toBe('#ff0000');
  });
  it('converts white (0, 0, 1)', () => {
    expect(hslToHex(0, 0, 1)).toBe('#ffffff');
  });
  it('converts black (0, 0, 0)', () => {
    expect(hslToHex(0, 0, 0)).toBe('#000000');
  });
  it('converts blue (240, 1, 0.5)', () => {
    expect(hslToHex(240, 1, 0.5)).toBe('#0000ff');
  });
  it('wraps hue > 360', () => {
    expect(hslToHex(360, 1, 0.5)).toBe(hslToHex(0, 1, 0.5));
  });
  it('wraps negative hue', () => {
    expect(hslToHex(-60, 1, 0.5)).toBe(hslToHex(300, 1, 0.5));
  });
});

describe('hexToRgb', () => {
  it('parses red', () => expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]));
  it('parses black', () => expect(hexToRgb('#000000')).toEqual([0, 0, 0]));
  it('parses white', () => expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]));
});

describe('hexToHsl', () => {
  it('round-trips red', () => {
    const [h, s, l] = hexToHsl('#ff0000');
    expect(h).toBeCloseTo(0, 0);
    expect(s).toBeCloseTo(1, 2);
    expect(l).toBeCloseTo(0.5, 2);
  });
  it('round-trips white', () => {
    const [h, s, l] = hexToHsl('#ffffff');
    expect(l).toBeCloseTo(1, 2);
  });
});
```

**Step 3: Run tests to verify they fail**

```bash
npx jest src/__tests__/ColorEngine.test.ts
```

Expected: `Cannot find module '../ColorEngine'`

**Step 4: Implement ColorEngine.ts with the conversion helpers**

```typescript
// src/ColorEngine.ts
import { HueShiftSettings, ColorPalette } from './types';

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360; // normalize to 0–360
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  const toHex = (n: number) =>
    Math.round(clamp((n + m) * 255, 0, 255)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6;                break;
    case b: h = ((r - g) / d + 4) / 6;                break;
  }
  return [h * 360, s, l];
}

export function hexToHsl(hex: string): [number, number, number] {
  return rgbToHsl(...hexToRgb(hex));
}

// Stub for computePalette — implemented in Task 5
export function computePalette(_settings: HueShiftSettings): ColorPalette {
  throw new Error('Not implemented');
}
```

**Step 5: Run tests to verify they pass**

```bash
npx jest src/__tests__/ColorEngine.test.ts
```

Expected: All conversion tests pass. `computePalette` tests not written yet — ignore.

**Step 6: Commit**

```bash
git add src/__mocks__/vscode.ts src/__tests__/ColorEngine.test.ts src/ColorEngine.ts
git commit -m "feat: add HSL/hex conversion helpers with tests"
```

---

## Task 4: Color math helpers — blend functions (TDD)

**Files:**
- Modify: `src/__tests__/ColorEngine.test.ts` (add tests)
- Modify: `src/ColorEngine.ts` (add implementations)

**Step 1: Add failing tests for mixColors, lighten, darken, addHex**

Append to `src/__tests__/ColorEngine.test.ts`:

```typescript
import { mixColors, lighten, darken, addHex } from '../ColorEngine';

describe('mixColors', () => {
  // weight=100 → all hex1, weight=0 → all hex2 (matches Less mix() semantics)
  it('returns hex1 at weight 100', () => {
    expect(mixColors('#ff0000', '#0000ff', 100)).toBe('#ff0000');
  });
  it('returns hex2 at weight 0', () => {
    expect(mixColors('#ff0000', '#0000ff', 0)).toBe('#0000ff');
  });
  it('blends 50/50', () => {
    expect(mixColors('#ff0000', '#0000ff', 50)).toBe('#7f007f');
  });
  it('clamps weight to 0–100', () => {
    expect(mixColors('#ffffff', '#000000', 200)).toBe('#ffffff');
  });
});

describe('lighten', () => {
  it('lightens black by 50% → mid gray', () => {
    const result = lighten('#000000', 50);
    const [, , l] = hexToHsl(result);
    expect(l).toBeCloseTo(0.5, 1);
  });
  it('clamps at white', () => {
    expect(lighten('#ffffff', 50)).toBe('#ffffff');
  });
});

describe('darken', () => {
  it('darkens white by 50% → mid gray', () => {
    const result = darken('#ffffff', 50);
    const [, , l] = hexToHsl(result);
    expect(l).toBeCloseTo(0.5, 1);
  });
  it('clamps at black', () => {
    expect(darken('#000000', 50)).toBe('#000000');
  });
});

describe('addHex', () => {
  it('adds components', () => {
    expect(addHex('#100000', '#010000')).toBe('#110000');
  });
  it('clamps at #ffffff', () => {
    expect(addHex('#ffffff', '#ffffff')).toBe('#ffffff');
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/__tests__/ColorEngine.test.ts --testNamePattern="mixColors|lighten|darken|addHex"
```

Expected: `mixColors is not a function`

**Step 3: Add implementations to ColorEngine.ts**

Add after `hexToHsl`:

```typescript
/** weight: 0–100. 100 = all hex1, 0 = all hex2. Matches Less mix() semantics. */
export function mixColors(hex1: string, hex2: string, weight: number): string {
  const w = clamp(weight, 0, 100) / 100;
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = Math.round(r1 * w + r2 * (1 - w));
  const g = Math.round(g1 * w + g2 * (1 - w));
  const b = Math.round(b1 * w + b2 * (1 - w));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/** amount: percentage points added to HSL lightness (0–100). */
export function lighten(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, clamp(l + amount / 100, 0, 1));
}

export function darken(hex: string, amount: number): string {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s, clamp(l - amount / 100, 0, 1));
}

/** Component-wise addition, clamped to 0–255 per channel. Mirrors Less + operator. */
export function addHex(hex1: string, hex2: string): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const r = clamp(r1 + r2, 0, 255);
  const g = clamp(g1 + g2, 0, 255);
  const b = clamp(b1 + b2, 0, 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/__tests__/ColorEngine.test.ts
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add src/__tests__/ColorEngine.test.ts src/ColorEngine.ts
git commit -m "feat: add mixColors, lighten, darken, addHex with tests"
```

---

## Task 5: Implement computePalette — structure test (TDD)

**Files:**
- Modify: `src/__tests__/ColorEngine.test.ts`
- Modify: `src/ColorEngine.ts`

**Step 1: Write failing tests for palette structure**

Append to `src/__tests__/ColorEngine.test.ts`:

```typescript
import { computePalette } from '../ColorEngine';
import type { HueShiftSettings } from '../types';

const DEFAULT_SETTINGS: HueShiftSettings = {
  hue: 250, saturation: 70, luminance: 70, aberration: 60,
  drift: 30, backgroundLevel: 30, dimMinor: 40,
  tint: '#808080', tintStrength: 0, brightness: 100, contrast: 100,
};

const HEX_RE = /^#[0-9a-f]{6}$/i;

describe('computePalette', () => {
  let palette: ReturnType<typeof computePalette>;
  beforeAll(() => { palette = computePalette(DEFAULT_SETTINGS); });

  const keys: Array<keyof ReturnType<typeof computePalette>> = [
    'primary', 'secondary', 'tertiary', 'background',
    'veryLightGray', 'lightGray', 'gray', 'darkGray', 'veryDarkGray',
    'keyword', 'string', 'variable', 'function', 'comment',
    'storage', 'parameter', 'operator', 'number',
  ];

  it.each(keys)('%s is a valid hex color', (key) => {
    expect(palette[key]).toMatch(HEX_RE);
  });

  it('background is darker than primary', () => {
    const [, , bgL] = hexToHsl(palette.background);
    const [, , priL] = hexToHsl(palette.primary);
    expect(bgL).toBeLessThan(priL);
  });

  it('gray scale is ordered light → dark', () => {
    const lum = (hex: string) => hexToHsl(hex)[2];
    expect(lum(palette.veryLightGray)).toBeGreaterThan(lum(palette.lightGray));
    expect(lum(palette.lightGray)).toBeGreaterThan(lum(palette.gray));
    expect(lum(palette.gray)).toBeGreaterThan(lum(palette.darkGray));
    expect(lum(palette.darkGray)).toBeGreaterThan(lum(palette.veryDarkGray));
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/__tests__/ColorEngine.test.ts --testNamePattern="computePalette"
```

Expected: `Error: Not implemented`

**Step 3: Implement computePalette in ColorEngine.ts**

Replace the stub `computePalette` with:

```typescript
export function computePalette(settings: HueShiftSettings): ColorPalette {
  const { hue, saturation, luminance, aberration, backgroundLevel, dimMinor, tint, tintStrength } = settings;

  const sat = saturation / 100; // 0–1
  const lum = luminance / 100;  // 0–1
  const ts  = tintStrength;     // 0–95 used as mix weight for tint

  // --- Base palette ---
  // Primary/secondary/tertiary: hue-shifted HSL colors, optionally blended with tint.
  // Mirrors: mix(@tint, hsla(@hue ± @aberration, @sat, @lum, 1), @tint-strength%)
  const rawPrimary   = hslToHex(hue,              sat, lum);
  const rawSecondary = hslToHex(hue + aberration,  sat, lum);
  const rawTertiary  = hslToHex(hue - aberration,  sat, lum);

  const primary   = mixColors(tint, rawPrimary,   ts); // ts=0 → rawPrimary
  const secondary = mixColors(tint, rawSecondary, ts);
  const tertiary  = mixColors(tint, rawTertiary,  ts);

  // --- Background ---
  // Foundation: very dark, barely saturated version of the base hue.
  // Mirrors: hsla(@hue, (@sat - 0.40)/10, (@lum)/10, 1)
  const foundationS = clamp((sat - 0.40) / 10, 0, 1);
  const foundationL = lum / 10;
  const foundation  = hslToHex(hue, foundationS, foundationL);

  // bg-color: lighten and saturate the foundation.
  // Mirrors: saturate(lighten(@foundation - #060606, backgroundLevel/5%), backgroundLevel/20%)
  const subtracted  = darken(foundation, 2.4); // ~#060606 component subtraction ≈ 2.4% darkening
  const bgLifted    = lighten(subtracted, backgroundLevel / 5);
  const [bgH, bgS, bgL] = hexToHsl(bgLifted);
  const bgColor     = hslToHex(bgH, clamp(bgS + backgroundLevel / 2000, 0, 1), bgL);

  // background: average bg-color with tint influence on hue/saturation.
  // Mirrors: hsla((@bg-hue + @tint-hue) / 2, (@bg-sat + @tint-sat) / 2, @bg-lum * 0.75, 1)
  const [bgH2, bgS2, bgL2] = hexToHsl(bgColor);
  const [tintH, tintS]     = hexToHsl(tint);
  const tintHueInfluence   = tintH * ts / 100;
  const tintSatInfluence   = tintS * ts / 100;
  const background = hslToHex(
    (bgH2 + tintHueInfluence) / 2,
    (bgS2 + tintSatInfluence) / 2,
    bgL2 * 0.75,
  );

  // --- Gray scale ---
  // Mirrors: mix(@tint, lighten/darken(@background-color, N%), @tint-strength%)
  const veryLightGray = mixColors(tint, lighten(background, 60), ts);
  const lightGray     = mixColors(tint, lighten(background, 40), ts);
  const gray          = mixColors(tint, lighten(background, 20), ts);
  const darkGray      = mixColors(tint, background,              ts);
  const veryDarkGray  = mixColors(tint, darken(background, 15),  ts);

  // --- Blend basis ---
  // Lightly muted primary used as the base for string/comment colors.
  // Mirrors: mix(@background-color, @primary + #777777, @dim-minor%)
  // dim-minor% of background + (100-dim-minor)% of lightened primary
  const lightenedPrimary = addHex(rawPrimary, '#777777');
  const blendBasis       = mixColors(background, lightenedPrimary, dimMinor);

  // --- Semantic token colors ---
  // Mirrors the syntax-variables.less assignments.
  const keyword   = primary;
  const storage   = primary;
  // @string: mix(@blend-basis, @primary, 60%) → 60% blendBasis + 40% raw primary
  const string    = mixColors(blendBasis, rawPrimary, 60);
  // @variable: mix(@blend-basis, @tertiary, 40%) → 40% blendBasis + 60% tertiary
  const variable  = mixColors(blendBasis, rawTertiary, 40);
  const func      = tertiary;
  // @comment: mix(@background-color, @gray, @dim-minor%) → barely distinguishable from bg
  const comment   = mixColors(background, gray, dimMinor);
  const parameter = secondary;
  const number    = tertiary;
  // operator: muted blend of blend-basis and primary
  const operator  = mixColors(blendBasis, rawPrimary, 25);

  return {
    primary, secondary, tertiary, background,
    veryLightGray, lightGray, gray, darkGray, veryDarkGray,
    keyword, string, variable, function: func,
    comment, storage, parameter, operator, number,
  };
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/__tests__/ColorEngine.test.ts
```

Expected: All tests pass including computePalette structure tests.

**Step 5: Commit**

```bash
git add src/__tests__/ColorEngine.test.ts src/ColorEngine.ts
git commit -m "feat: implement computePalette with full HSL color derivation"
```

---

## Task 6: Implement ThemeApplicator (TDD)

**Files:**
- Create: `src/__tests__/ThemeApplicator.test.ts`
- Create: `src/ThemeApplicator.ts`

**Step 1: Write failing tests**

```typescript
// src/__tests__/ThemeApplicator.test.ts
const mockUpdate = jest.fn().mockResolvedValue(undefined);

jest.mock('vscode', () => ({
  workspace: {
    getConfiguration: jest.fn(() => ({ update: mockUpdate })),
  },
  ConfigurationTarget: { Global: 1 },
}), { virtual: true });

import { applyTheme, clearTheme } from '../ThemeApplicator';
import type { ColorPalette } from '../types';

const PALETTE: ColorPalette = {
  primary: '#7c6fcf', secondary: '#cf6f9a', tertiary: '#6fcfc4',
  background: '#1a1a2e', veryLightGray: '#c8c8e0', lightGray: '#9090b0',
  gray: '#606080', darkGray: '#2a2a40', veryDarkGray: '#15152a',
  keyword: '#7c6fcf', string: '#9c8fcf', variable: '#6fcfc4',
  function: '#6fcfc4', comment: '#404060', storage: '#7c6fcf',
  parameter: '#cf6f9a', operator: '#8080a0', number: '#6fcfc4',
};

beforeEach(() => mockUpdate.mockClear());

describe('applyTheme', () => {
  it('calls update for workbench.colorCustomizations', async () => {
    await applyTheme(PALETTE);
    expect(mockUpdate).toHaveBeenCalledWith(
      'workbench.colorCustomizations',
      expect.objectContaining({ 'editor.background': PALETTE.background }),
      1,
    );
  });

  it('calls update for editor.tokenColorCustomizations', async () => {
    await applyTheme(PALETTE);
    expect(mockUpdate).toHaveBeenCalledWith(
      'editor.tokenColorCustomizations',
      expect.objectContaining({ textMateRules: expect.any(Array) }),
      1,
    );
  });

  it('includes a comment token rule', async () => {
    await applyTheme(PALETTE);
    const tokenCall = mockUpdate.mock.calls.find(c => c[0] === 'editor.tokenColorCustomizations');
    const rules = tokenCall[1].textMateRules as Array<{ scope: string | string[]; settings: { foreground: string } }>;
    const commentRule = rules.find(r =>
      Array.isArray(r.scope) ? r.scope.includes('comment') : r.scope === 'comment'
    );
    expect(commentRule?.settings.foreground).toBe(PALETTE.comment);
  });
});

describe('clearTheme', () => {
  it('sets workbench.colorCustomizations to undefined', async () => {
    await clearTheme();
    expect(mockUpdate).toHaveBeenCalledWith('workbench.colorCustomizations', undefined, 1);
  });

  it('sets editor.tokenColorCustomizations to undefined', async () => {
    await clearTheme();
    expect(mockUpdate).toHaveBeenCalledWith('editor.tokenColorCustomizations', undefined, 1);
  });
});
```

**Step 2: Run tests to verify they fail**

```bash
npx jest src/__tests__/ThemeApplicator.test.ts
```

Expected: `Cannot find module '../ThemeApplicator'`

**Step 3: Implement ThemeApplicator.ts**

```typescript
// src/ThemeApplicator.ts
import * as vscode from 'vscode';
import { ColorPalette } from './types';

function buildWorkbenchColors(p: ColorPalette): Record<string, string> {
  return {
    'editor.background':                    p.background,
    'editor.foreground':                    p.veryLightGray,
    'editor.selectionBackground':           p.darkGray + '55',
    'editorCursor.foreground':              p.primary,
    'editorLineNumber.foreground':          p.gray,
    'editorLineNumber.activeForeground':    p.lightGray,
    'editorGutter.background':              p.background,
    'editorIndentGuide.background':         p.darkGray,
    'editorIndentGuide.activeBackground':   p.gray,
    'editorBracketMatch.background':        p.tertiary + '33',
    'editorBracketMatch.border':            p.tertiary,
    'editorWhitespace.foreground':          p.darkGray,
    'editorRuler.foreground':               p.darkGray,
  };
}

function buildTokenColors(p: ColorPalette): object {
  return {
    textMateRules: [
      {
        scope: ['comment', 'punctuation.definition.comment'],
        settings: { foreground: p.comment, fontStyle: 'italic' },
      },
      {
        scope: ['string', 'string.quoted', 'string.template'],
        settings: { foreground: p.string },
      },
      {
        scope: ['keyword', 'keyword.control', 'keyword.operator.new',
                'storage.type', 'storage.modifier'],
        settings: { foreground: p.keyword },
      },
      {
        scope: ['entity.name.function', 'support.function',
                'meta.function-call.generic', 'variable.function'],
        settings: { foreground: p.function },
      },
      {
        scope: ['variable', 'variable.other.readwrite'],
        settings: { foreground: p.variable },
      },
      {
        scope: ['variable.parameter'],
        settings: { foreground: p.parameter },
      },
      {
        scope: ['entity.name.type', 'entity.name.class',
                'support.class', 'support.type'],
        settings: { foreground: p.storage },
      },
      {
        scope: ['constant.numeric', 'constant.language'],
        settings: { foreground: p.number },
      },
      {
        scope: ['keyword.operator', 'punctuation.separator',
                'punctuation.terminator'],
        settings: { foreground: p.operator },
      },
    ],
  };
}

export async function applyTheme(palette: ColorPalette): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  await Promise.all([
    config.update(
      'workbench.colorCustomizations',
      buildWorkbenchColors(palette),
      vscode.ConfigurationTarget.Global,
    ),
    config.update(
      'editor.tokenColorCustomizations',
      buildTokenColors(palette),
      vscode.ConfigurationTarget.Global,
    ),
  ]);
}

export async function clearTheme(): Promise<void> {
  const config = vscode.workspace.getConfiguration();
  await Promise.all([
    config.update('workbench.colorCustomizations',  undefined, vscode.ConfigurationTarget.Global),
    config.update('editor.tokenColorCustomizations', undefined, vscode.ConfigurationTarget.Global),
  ]);
}
```

**Step 4: Run tests to verify they pass**

```bash
npx jest src/__tests__/ThemeApplicator.test.ts
```

Expected: All 5 tests pass.

**Step 5: Run all tests**

```bash
npx jest
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add src/__tests__/ThemeApplicator.test.ts src/ThemeApplicator.ts
git commit -m "feat: implement ThemeApplicator with workbench and token color writers"
```

---

## Task 7: Implement extension.ts

**Files:**
- Create: `src/extension.ts`

No test needed here — `extension.ts` is pure wiring; the two components it connects are already tested.

**Step 1: Create src/extension.ts**

```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { computePalette } from './ColorEngine';
import { applyTheme, clearTheme } from './ThemeApplicator';
import type { HueShiftSettings } from './types';

function readSettings(): HueShiftSettings {
  const c = vscode.workspace.getConfiguration('hueShift');
  return {
    hue:             c.get('hue',             250),
    saturation:      c.get('saturation',      70),
    luminance:       c.get('luminance',       70),
    aberration:      c.get('aberration',      60),
    drift:           c.get('drift',           30),
    backgroundLevel: c.get('backgroundLevel', 30),
    dimMinor:        c.get('dimMinor',        40),
    tint:            c.get('tint',            '#808080'),
    tintStrength:    c.get('tintStrength',    0),
    brightness:      c.get('brightness',      100),
    contrast:        c.get('contrast',        100),
  };
}

function applyCurrentSettings(): void {
  const settings = readSettings();
  const palette  = computePalette(settings);
  applyTheme(palette).catch(err =>
    vscode.window.showErrorMessage(`Hue Shift: failed to apply theme — ${err}`),
  );
}

export function activate(context: vscode.ExtensionContext): void {
  applyCurrentSettings();

  const watcher = vscode.workspace.onDidChangeConfiguration(event => {
    if (event.affectsConfiguration('hueShift')) {
      applyCurrentSettings();
    }
  });

  context.subscriptions.push(watcher);
}

export function deactivate(): Thenable<void> {
  return clearTheme();
}
```

**Step 2: Compile to verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors.

**Step 3: Run all tests one final time**

```bash
npx jest
```

Expected: All tests pass.

**Step 4: Compile to output**

```bash
npx tsc -p ./
```

Expected: `out/` directory created with `extension.js`, `ColorEngine.js`, `ThemeApplicator.js`, `types.js`.

**Step 5: Commit**

```bash
git add src/extension.ts
git commit -m "feat: implement extension activation with live settings watcher"
```

---

## Task 8: Update README and finalize

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`

**Step 1: Replace README.md**

```markdown
# Hue Shift Syntax

A configurable VS Code syntax color theme driven by HSL color theory.

## How it works

The extension reads your settings, computes a full color palette using HSL
math, and writes the result to your VS Code color customizations — applying
immediately whenever you change a setting.

## Configuration

All settings live under `hueShift.*` in your VS Code settings:

| Setting | Default | Description |
|---------|---------|-------------|
| `hueShift.hue` | `250` | Base hue (1–360) |
| `hueShift.saturation` | `70` | Color vividness (1–100) |
| `hueShift.luminance` | `70` | Token brightness (30–100) |
| `hueShift.aberration` | `60` | Hue offset for secondary/tertiary (15–165) |
| `hueShift.drift` | `30` | Luminance variance (0–100) |
| `hueShift.backgroundLevel` | `30` | Editor background brightness (1–100) |
| `hueShift.dimMinor` | `40` | Muting for comments/strings (10–90) |
| `hueShift.tint` | `#808080` | Global tint color |
| `hueShift.tintStrength` | `0` | Tint blend strength (0–95) |
| `hueShift.brightness` | `100` | Brightness multiplier (60–200) |
| `hueShift.contrast` | `100` | Contrast multiplier (40–250) |

## License

MIT © Tuomas Hatakka
```

**Step 2: Add a CHANGELOG entry**

Prepend to `CHANGELOG.md`:

```markdown
## [1.0.0] — 2026-03-08

### Breaking change

Complete rewrite as a TypeScript VS Code extension. Removes all Atom-specific
code. Color palette computation is now pure TypeScript; colors are applied via
`workbench.colorCustomizations` and `editor.tokenColorCustomizations` and
update live when settings change.
```

**Step 3: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: update README and CHANGELOG for 1.0.0 VS Code release"
```

---

## Done

Run the extension in VS Code:

```bash
# Open VS Code from the project root
code .
# Press F5 → Extension Development Host opens
# Change any hueShift.* setting → colors update immediately
```
