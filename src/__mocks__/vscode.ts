export const workspace = {
  getConfiguration:         jest.fn(),
  onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() })),
}
export const ConfigurationTarget = { Global: 1, Workspace: 2, WorkspaceFolder: 3 }
export const window = {
  showErrorMessage: jest.fn(),
}
