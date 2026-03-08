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
