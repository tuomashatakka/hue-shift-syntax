# Hue Shift Syntax

<div align="center">
  <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
    <div style="width: 60px; height: 60px; background-color: #FFD1DC; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #333;">#FFD1DC</div>
    <div style="width: 60px; height: 60px; background-color: #FFE5B4; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #333;">#FFE5B4</div>
    <div style="width: 60px; height: 60px; background-color: #FFFFE0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #333;">#FFFFE0</div>
    <div style="width: 60px; height: 60px; background-color: #E6E6FA; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #333;">#E6E6FA</div>
    <div style="width: 60px; height: 60px; background-color: #B5EAD7; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #333;">#B5EAD7</div>
    <div style="width: 60px; height: 60px; background-color: #C7CEEA; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #333;">#C7CEEA</div>
  </div>
</div>

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