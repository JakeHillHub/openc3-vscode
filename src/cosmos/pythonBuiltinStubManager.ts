import * as vscode from 'vscode';
import { FileManagedSection } from '../utility';
import path from 'path';

export class PyBuiltinStubManager extends FileManagedSection {
  public static readonly managedMarkerStart = '### OPENC3_BUILTIN_STUBS_MANAGED_START ###';
  public static readonly managedMarkerEnd = '### OPENC3_BUILTIN_STUBS_MANAGED_END ###';

  private enabled: boolean = true;

  constructor(outputChannel: vscode.OutputChannel) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      super(
        'undefined',
        PyBuiltinStubManager.managedMarkerStart,
        PyBuiltinStubManager.managedMarkerEnd,
        outputChannel
      );
      this.enabled = false;
      return;
    }

    const builtinsPath = path.join(
      workspaceFolder.uri.fsPath,
      '.vscode',
      'pystubs',
      '__builtins__.pyi'
    );
    super(
      builtinsPath,
      PyBuiltinStubManager.managedMarkerStart,
      PyBuiltinStubManager.managedMarkerEnd,
      outputChannel
    );
  }

  public async setStubIncludes(includes: string[]) {
    if (!this.enabled) {
      return;
    }
    await this.updateAllLines(includes);
  }
}
