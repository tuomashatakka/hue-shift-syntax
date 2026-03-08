import * as vscode from 'vscode'
import { ColorPalette } from './types'


function buildWorkbenchColors (p: ColorPalette): Record<string, string> {
  return {
    'editor.background':                  p.background,
    'editor.foreground':                  p.veryLightGray,
    'editor.selectionBackground':         p.darkGray + '55',
    'editorCursor.foreground':            p.primary,
    'editorLineNumber.foreground':        p.gray,
    'editorLineNumber.activeForeground':  p.lightGray,
    'editorGutter.background':            p.background,
    'editorIndentGuide.background':       p.darkGray,
    'editorIndentGuide.activeBackground': p.gray,
    'editorBracketMatch.background':      p.tertiary + '33',
    'editorBracketMatch.border':          p.tertiary,
    'editorWhitespace.foreground':        p.darkGray,
    'editorRuler.foreground':             p.darkGray,
  }
}

function buildTokenColors (p: ColorPalette): object {
  return {
    textMateRules: [
      {
        scope:    [ 'comment', 'punctuation.definition.comment' ],
        settings: { foreground: p.comment, fontStyle: 'italic' },
      },
      {
        scope:    [ 'string', 'string.quoted', 'string.template' ],
        settings: { foreground: p.string },
      },
      {
        scope: [ 'keyword', 'keyword.control', 'keyword.operator.new',
          'storage.type', 'storage.modifier' ],
        settings: { foreground: p.keyword },
      },
      {
        scope: [ 'entity.name.function', 'support.function',
          'meta.function-call.generic', 'variable.function' ],
        settings: { foreground: p.function },
      },
      {
        scope:    [ 'variable', 'variable.other.readwrite' ],
        settings: { foreground: p.variable },
      },
      {
        scope:    [ 'variable.parameter' ],
        settings: { foreground: p.parameter },
      },
      {
        scope: [ 'entity.name.type', 'entity.name.class',
          'support.class', 'support.type' ],
        settings: { foreground: p.storage },
      },
      {
        scope:    [ 'constant.numeric', 'constant.language' ],
        settings: { foreground: p.number },
      },
      {
        scope: [ 'keyword.operator', 'punctuation.separator',
          'punctuation.terminator' ],
        settings: { foreground: p.operator },
      },
    ],
  }
}

export async function applyTheme (palette: ColorPalette): Promise<void> {
  const config = vscode.workspace.getConfiguration()
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
  ])
}

export async function clearTheme (): Promise<void> {
  const config = vscode.workspace.getConfiguration()
  await Promise.all([
    config.update('workbench.colorCustomizations', undefined, vscode.ConfigurationTarget.Global),
    config.update('editor.tokenColorCustomizations', undefined, vscode.ConfigurationTarget.Global),
  ])
}
