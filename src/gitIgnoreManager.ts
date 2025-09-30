/**
 * Git Ignore Management
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { FileManagedSection } from './utility';

export class GitIgnoreManager extends FileManagedSection {
  public static readonly managedMarkerStart = '### OPENC3_EXTENSION_MANAGED_START ###';
  public static readonly managedMarkerEnd = '### OPENC3_EXTENSION_MANAGED_END ###';

  private enabled: boolean = true;

  constructor(outputChannel: vscode.OutputChannel) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      super(
        'undefined',
        GitIgnoreManager.managedMarkerStart,
        GitIgnoreManager.managedMarkerEnd,
        outputChannel
      );
      this.enabled = false;
      return;
    }

    const ignorePath = path.join(workspaceFolder.uri.fsPath, '.gitignore');
    super(
      ignorePath,
      GitIgnoreManager.managedMarkerStart,
      GitIgnoreManager.managedMarkerEnd,
      outputChannel
    );
  }

  public async initializeGitIgnore(...initialPatterns: string[]) {
    const config = vscode.workspace.getConfiguration(); /* Query the enable status */
    this.enabled = config.get('openc3.autoGitignore', true);
    if (!this.enabled) {
      /* Cleanup managed section markers if disabled */
      await this.removeSection();
    } else {
      await this.initializeSection(...initialPatterns);
    }
  }

  public async addPattern(ignorePattern: string) {
    if (!this.enabled) {
      return;
    }

    await this.addLine(ignorePattern);
  }

  public async getPatterns(): Promise<string[] | undefined> {
    return await this.getLines();
  }
}
