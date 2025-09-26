/**
 * Git Ignore Management
 */

import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';

export class GitIgnoreManager {
  public static readonly managedMarkerStart = '### OPENC3_EXTENSION_MANAGED_START ###';
  public static readonly managedMarkerEnd = '### OPENC3_EXTENSION_MANAGED_END ###';

  private outputChannel: vscode.OutputChannel;

  private enabled: boolean;
  private gitIgnorePath: string = '';
  private managedRegex: RegExp;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;

    const config = vscode.workspace.getConfiguration();
    this.enabled = config.get('openc3.autoGitignore', true);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this.enabled = false;
    } else {
      this.gitIgnorePath = path.join(workspaceFolder.uri.fsPath, '.gitignore');
    }

    this.managedRegex = new RegExp(
      `${GitIgnoreManager.managedMarkerStart}(.+?)${GitIgnoreManager.managedMarkerEnd}`,
      'sg'
    );
  }

  /**
   * Ensure .gitignore exists if not already created
   */
  public async ensureGitIgnore() {
    if (!this.enabled) {
      return;
    }

    try {
      await fs.access(this.gitIgnorePath);
    } catch (err) {
      await fs.writeFile(this.gitIgnorePath, '');
    }
  }

  private async getManagedSection(_writeBack?: boolean): Promise<string[] | undefined> {
    if (!this.enabled) {
      return undefined;
    }

    try {
      const contents = await fs.readFile(this.gitIgnorePath, 'utf-8');
      const sectionMatch = contents.match(this.managedRegex);
      if (!sectionMatch) {
        if (_writeBack) {
          return undefined; /* Prevent infinite retry recursion */
        }

        const writeBack =
          contents +
          `\n${GitIgnoreManager.managedMarkerStart}\n${GitIgnoreManager.managedMarkerEnd}`;
        await fs.writeFile(this.gitIgnorePath, writeBack);
        return await this.getManagedSection(true); /* Retry with section added */
      }

      const [_, section] = sectionMatch;
      const sectionLines = section.split(/\r?\n/);
      const retLines = [];
      for (const line of sectionLines) {
        retLines.push(line.trim());
      }
      return retLines;
    } catch (err) {
      this.outputChannel.appendLine(`error reading gitignore managed section ${err}`);
      return undefined;
    }
  }
}
