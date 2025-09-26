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

  private enabled: boolean = true;
  private gitIgnorePath: string = '';
  private contentsRegex: RegExp;
  private fullBlockRegex: RegExp;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      this.enabled = false;
    } else {
      this.gitIgnorePath = path.join(workspaceFolder.uri.fsPath, '.gitignore');
    }

    this.contentsRegex = new RegExp(
      `${GitIgnoreManager.managedMarkerStart}(.+?)${GitIgnoreManager.managedMarkerEnd}`,
      's'
    );
    this.fullBlockRegex = new RegExp(
      `${GitIgnoreManager.managedMarkerStart}(.+?)${GitIgnoreManager.managedMarkerEnd}`,
      'sg'
    );
  }

  /**
   * Ensure .gitignore exists if not already created
   */
  public async initializeGitIgnore(...initialPatterns: string[]) {
    const config = vscode.workspace.getConfiguration(); /* Query the enable status */
    this.enabled = config.get('openc3.autoGitignore', true);

    if (!this.enabled) {
      try {
        /* Cleanup after ourselves if disabled by user */
        await fs.access(this.gitIgnorePath);
        const contents = await fs.readFile(this.gitIgnorePath, 'utf-8');
        if (contents.match(this.contentsRegex)) {
          /* Block already exists, remove it */
          const writeBack = contents.replace(this.fullBlockRegex, '');
          await fs.writeFile(this.gitIgnorePath, writeBack);
        }
      } catch (err) {
        return; /* No .gitignore, no worries */
      }
      return;
    }

    try {
      await fs.access(this.gitIgnorePath);
    } catch (err) {
      await fs.writeFile(
        this.gitIgnorePath,
        `${GitIgnoreManager.managedMarkerStart}\n${GitIgnoreManager.managedMarkerEnd}`
      );
    }

    for (const pattern of initialPatterns) {
      await this.addPattern(pattern);
    }
  }

  public async addPattern(ignorePattern: string) {
    if (!this.enabled) {
      return;
    }

    const patterns = await this.getPatterns();
    if (patterns === undefined) {
      return;
    }

    const patternSet = new Set<string>();
    for (const pattern of patterns) {
      patternSet.add(pattern);
    }
    patternSet.add(ignorePattern);

    const writeBackPatterns = [];
    for (const pattern of patternSet) {
      writeBackPatterns.push(pattern);
    }

    await this.setPatterns(writeBackPatterns);
  }

  /**
   * Get managed section from gitignore, if it does not exist will retry to create it
   * @param _writeBack internal use only, do not specify
   * @returns {Promise<string[] | undefined>} each pattern line as a list
   */
  private async getPatterns(_writeBack?: boolean): Promise<string[] | undefined> {
    if (!this.enabled) {
      return undefined;
    }

    try {
      const contents = await fs.readFile(this.gitIgnorePath, 'utf-8');
      const sectionMatch = contents.match(this.contentsRegex);
      if (!sectionMatch) {
        if (_writeBack) {
          return undefined; /* Prevent infinite retry recursion */
        }

        const intializeBlock =
          contents +
          `\n\n${GitIgnoreManager.managedMarkerStart}\n${GitIgnoreManager.managedMarkerEnd}\n`;
        await fs.writeFile(this.gitIgnorePath, intializeBlock);
        return await this.getPatterns(true); /* Retry with section added */
      }

      const [_, section] = sectionMatch;
      const sectionLines = section.trim().split(/\r?\n/);
      const retLines = [];
      for (const line of sectionLines) {
        if (line === '') {
          continue;
        }
        retLines.push(line.trim());
      }
      return retLines;
    } catch (err) {
      this.outputChannel.appendLine(`error reading gitignore managed section ${err}`);
      return undefined;
    }
  }

  private async setPatterns(patterns: string[]) {
    try {
      const contents = await fs.readFile(this.gitIgnorePath, 'utf-8');
      const newBlock = `${GitIgnoreManager.managedMarkerStart}\n${patterns.join('\n')}\n${GitIgnoreManager.managedMarkerEnd}`;
      const replaced = contents.replace(this.fullBlockRegex, newBlock);
      await fs.writeFile(this.gitIgnorePath, replaced);
    } catch (err) {
      this.outputChannel.appendLine(`failed to set patterns in .gitignore ${err}`);
    }
  }
}
