import { applyTheme, clearTheme } from '../ThemeApplicator'
import type { ColorPalette } from '../types'


const PALETTE: ColorPalette = {
  primary:       '#7c6fcf',
  secondary:     '#cf6f9a',
  tertiary:      '#6fcfc4',
  background:    '#1a1a2e',
  veryLightGray: '#c8c8e0',
  lightGray:     '#9090b0',
  gray:          '#606080',
  darkGray:      '#2a2a40',
  veryDarkGray:  '#15152a',
  keyword:       '#7c6fcf',
  string:        '#9c8fcf',
  variable:      '#6fcfc4',
  function:      '#6fcfc4',
  comment:       '#404060',
  storage:       '#7c6fcf',
  parameter:     '#cf6f9a',
  operator:      '#8080a0',
  number:        '#6fcfc4',
}

const mockUpdate = jest.fn().mockResolvedValue(undefined)

jest.mock('vscode', () => ({
  workspace: {
    getConfiguration: jest.fn(() => ({ update: mockUpdate })),
  },
  window: {
    showErrorMessage: jest.fn(),
  },
  ConfigurationTarget: { Global: 1 },
}))

beforeEach(() => mockUpdate.mockClear())

describe('applyTheme', () => {
  it('calls update for workbench.colorCustomizations', async () => {
    await applyTheme(PALETTE)
    expect(mockUpdate).toHaveBeenCalledWith(
      'workbench.colorCustomizations',
      expect.objectContaining({ 'editor.background': PALETTE.background }),
      1,
    )
  })

  it('calls update for editor.tokenColorCustomizations', async () => {
    await applyTheme(PALETTE)
    expect(mockUpdate).toHaveBeenCalledWith(
      'editor.tokenColorCustomizations',
      expect.objectContaining({ textMateRules: expect.any(Array) }),
      1,
    )
  })

  it('includes a comment token rule', async () => {
    await applyTheme(PALETTE)

    const tokenCall = mockUpdate.mock.calls.find(c => c[0] === 'editor.tokenColorCustomizations')
    const rules = tokenCall[1].textMateRules as Array<{ scope: string | string[]; settings: { foreground: string }}>
    const commentRule = rules.find(r =>
      Array.isArray(r.scope) ? r.scope.includes('comment') : r.scope === 'comment'
    )
    expect(commentRule?.settings.foreground).toBe(PALETTE.comment)
  })
})

describe('clearTheme', () => {
  it('sets workbench.colorCustomizations to undefined', async () => {
    await clearTheme()
    expect(mockUpdate).toHaveBeenCalledWith('workbench.colorCustomizations', undefined, 1)
  })

  it('sets editor.tokenColorCustomizations to undefined', async () => {
    await clearTheme()
    expect(mockUpdate).toHaveBeenCalledWith('editor.tokenColorCustomizations', undefined, 1)
  })
})
