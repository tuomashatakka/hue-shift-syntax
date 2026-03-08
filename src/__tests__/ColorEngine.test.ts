import { mixColors, lighten, darken, addHex, hexToHsl } from '../ColorEngine'


describe('mixColors', () => {
  it('mixes colors with 0% weight', () => {
    expect(mixColors('#ff0000', '#0000ff', 0)).toBe('#0000ff')
  })
  it('mixes colors with 100% weight', () => {
    expect(mixColors('#ff0000', '#0000ff', 100)).toBe('#ff0000')
  })
  it('mixes colors with 50% weight', () => {
    expect(mixColors('#ff0000', '#0000ff', 50)).toBe('#800080')
  })
})

describe('lighten', () => {
  it('lightens red by 10%', () => {
    expect(lighten('#ff0000', 10)).toBe('#ff3333')
  })
  it('lightens white by 50%', () => {
    expect(lighten('#ffffff', 50)).toBe('#ffffff')
  })
})

describe('darken', () => {
  it('darkens blue by 20%', () => {
    expect(darken('#0000ff', 20)).toBe('#000099')
  })
  it('darkens black by 10%', () => {
    expect(darken('#000000', 10)).toBe('#000000')
  })
})

describe('addHex', () => {
  it('adds red and green', () => {
    expect(addHex('#ff0000', '#00ff00')).toBe('#ffff00')
  })
  it('adds white and black', () => {
    expect(addHex('#ffffff', '#000000')).toBe('#ffffff')
  })
  it('adds colors with overflow', () => {
    expect(addHex('#808080', '#808080')).toBe('#ffffff')
  })
})
