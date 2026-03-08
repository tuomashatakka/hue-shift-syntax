# Design: Hue Shift Syntax — VS Code Extension Refactor

**Date**: 2026-03-08
**Status**: Approved

## Summary

Refactor the existing Atom syntax theme package into a VS Code extension written in TypeScript. The extension reads user settings (hue, saturation, luminance, and modifiers), computes a color palette using the same HSL math as the original, and writes the result to `workbench.colorCustomizations` and `editor.tokenColorCustomizations` in VS Code settings — applying immediately on every change, no window reload required.

## Architecture

```
extension.ts          ← activation, lifecycle, onDidChangeConfiguration watcher
src/
  ColorEngine.ts      ← pure HSL math, zero VS Code dependencies
  ThemeApplicator.ts  ← writes VS Code workbench/token color settings
  types.ts            ← shared TypeScript interfaces
```

**ColorEngine** is framework-agnostic: takes a `HueShiftSettings` object, returns a typed `ColorPalette` of hex strings. It is independently testable.

**ThemeApplicator** takes a `ColorPalette` and calls `vscode.workspace.getConfiguration().update()` to apply colors globally.

**extension.ts** registers `onDidChangeConfiguration`, reads settings, calls `ColorEngine`, passes result to `ThemeApplicator`. On deactivate, clears the customizations.

## Settings Schema

Contributed via `package.json` `contributes.configuration`:

| Key | Type | Range | Default | Description |
|-----|------|-------|---------|-------------|
| `hueShift.hue` | number | 1–360 | 250 | Base hue |
| `hueShift.saturation` | number | 1–100 | 70 | Color vividness |
| `hueShift.luminance` | number | 30–100 | 70 | Brightness |
| `hueShift.aberration` | number | 15–165 | 60 | Hue offset for secondary/tertiary |
| `hueShift.drift` | number | 0–100 | 30 | Luminance variance across colors |
| `hueShift.backgroundLevel` | number | 1–100 | 30 | Background brightness |
| `hueShift.dimMinor` | number | 10–90 | 40 | Muting for comments/strings |
| `hueShift.tint` | string | hex | #808080 | Global tint color |
| `hueShift.tintStrength` | number | 0–95 | 0 | Tint blend amount |
| `hueShift.brightness` | number | 60–200 | 100 | Token brightness modifier |
| `hueShift.contrast` | number | 40–250 | 100 | Token contrast modifier |

## Color Computation (ColorEngine)

Mirrors the original LESS color math in pure TypeScript:

1. **Primary**: `hsl(hue, sat, lum)` mixed with tint at `tintStrength%`
2. **Secondary**: `hsl(hue + aberration, sat, lum)` + tint mix
3. **Tertiary**: `hsl(hue - aberration, sat, lum)` + tint mix
4. **Background**: dark foundation `hsl(hue, (sat-0.4)/10, lum/10)`, lightened by `backgroundLevel`
5. **Gray scale**: very-light → very-dark derived from background
6. **Blend basis**: `mix(background, primary, dimMinor%)` — used for muted tones
7. **Semantic roles**: keyword, string, variable, function, comment, storage, parameter, operator, number

All output as hex strings in a typed `ColorPalette` object.

Helper functions needed: `hslToHex`, `mixColors`, `lighten`, `darken`, `desaturate`, `clamp`.

## VS Code API Integration (ThemeApplicator)

Writes two configuration keys via `ConfigurationTarget.Global`:

### `workbench.colorCustomizations`
- `editor.background`, `editor.foreground`
- `editor.selectionBackground`, `editorCursor.foreground`
- `editorGutter.background`, `editorGutter.foreground`
- `editorIndentGuide.background`, `editorIndentGuide.activeBackground`
- `editorBracketMatch.background`, `editorBracketMatch.border`
- `editorLineNumber.foreground`, `editorLineNumber.activeForeground`

### `editor.tokenColorCustomizations`
Uses the `textMateRules` array for fine-grained scope targeting:
- `comment` → muted blend-basis color
- `string` → string role color
- `keyword`, `storage.type`, `storage.modifier` → keyword color
- `entity.name.function`, `support.function` → function color
- `variable`, `variable.parameter` → variable/parameter colors
- `entity.name.type`, `entity.name.class` → storage color
- `constant.numeric` → value color
- `keyword.operator` → operator color

## File Structure

```
hue-shift-syntax/
  package.json           ← VS Code extension manifest
  tsconfig.json          ← TypeScript config targeting ES2020
  .vscodeignore
  src/
    extension.ts
    ColorEngine.ts
    ThemeApplicator.ts
    types.ts
  docs/
    plans/
      2026-03-08-vscode-refactor-design.md
  CHANGELOG.md
  README.md
```

All Atom files removed: `lib/`, `styles/`, `conf/`, `keymaps/`, `menus/`, `spec/`, `index.less`, `pigments-report.json`, `_config.yml`, `fixtures/`.

## Decisions

- **No preset system** — Removed. VS Code settings profiles cover this use case natively.
- **No webview preview** — Not in scope. Color changes apply live via settings.
- **Core token colors only** — General TextMate scopes, no language-specific overrides.
- **No LESS** — All color math ported to TypeScript. No runtime style injection.
- **No React** — No UI components needed.
- **ConfigurationTarget.Global** — Colors apply user-wide, not just to the current workspace.
