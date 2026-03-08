export interface HueShiftSettings {
  hue:             number; // 1–360
  saturation:      number; // 1–100
  luminance:       number; // 30–100
  aberration:      number; // 15–165, hue offset for secondary/tertiary
  drift:           number; // 0–100, luminance variance
  backgroundLevel: number; // 1–100
  dimMinor:        number; // 10–90, muting for comments/strings
  tint:            string; // hex color
  tintStrength:    number; // 0–95
  brightness:      number; // 60–200
  contrast:        number; // 40–250
}

export interface ColorPalette {
  // HSL-derived base
  primary:       string;
  secondary:     string;
  tertiary:      string;
  background:    string;
  // Gray scale (derived from background)
  veryLightGray: string;
  lightGray:     string;
  gray:          string;
  darkGray:      string;
  veryDarkGray:  string;
  // Semantic token roles
  keyword:       string;
  string:        string;
  variable:      string;
  function:      string;
  comment:       string;
  storage:       string;
  parameter:     string;
  operator:      string;
  number:        string;
}
