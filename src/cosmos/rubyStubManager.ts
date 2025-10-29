import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export class RubyStubManager {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  public getRbStubsIgnore(): string | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return undefined;
    }
    const stubPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'rbstubs');
    return vscode.workspace.asRelativePath(stubPath);
  }

  public async probeLoadUtility(doc: vscode.TextDocument) {
    this.outputChannel.appendLine('rb probe load utility not implemented');
  }

  public createSubscriptions(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor) {
          return;
        }

        const fileName = editor.document.fileName;
        if (fileName.endsWith('.rb')) {
          this.probeLoadUtility(editor.document);
        }
      }),
    ];
  }

  /**
   * Run initialization steps to configure workspace properly
   */
  public async initializeStubs(ignoredDirsPattern: string) {
    await this.copyCosmosAPIStubs();
    await this.configureAPIStubs();
    await this.addAllExistingPluginStubs(ignoredDirsPattern);

    setTimeout(() => {
      if (vscode.window.activeTextEditor) {
        const fileName = vscode.window.activeTextEditor.document.fileName;
        if (fileName.endsWith('.rb')) {
          this.probeLoadUtility(vscode.window.activeTextEditor.document);
        }
      }
    }, 10000); /* Hopefully pull in activatation without requiring active switch - not extra important, but makes the initial load "cleaner" */
  }

  /**
   * Only run once during initialization to refresh/copy builtin stubs for api functions
   */
  private async copyCosmosAPIStubs() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    const stubDir = path.join(workspaceFolder.uri.fsPath, '.vscode', 'rbstubs');
    if (!fs.access(stubDir)) {
      await fs.mkdir(stubDir, { recursive: true });
    }

    const stubSrc = path.resolve(__dirname, 'rbstubs');
    await fs.cp(stubSrc, stubDir, { recursive: true });
  }

  /**
   * Add hide .pyi to workspace configuration
   */
  public async configureHiddenStubs() {
    const config = vscode.workspace.getConfiguration();
    const hidden = config.get('openc3.autoEditorHide', true);
    const filesExcluded = config.get('files.exclude', {}) as any;

    const hiddenPatterns = ['**/rbstubs'];
    if (hidden) {
      for (const pattern of hiddenPatterns) {
        filesExcluded[pattern] = true;
      }
      await config.update('files.exclude', filesExcluded);
    } else {
      for (const pattern of hiddenPatterns) {
        filesExcluded[pattern] = undefined;
      }
      await config.update('files.exclude', filesExcluded);
    }
  }

  /**
   * Add API stubs to ruby steep configuration
   */
  private async configureAPIStubs() {
    // const config = vscode.workspace.getConfiguration();
    // const settingPath = 'python.analysis.stubPath';
    // await config.update(settingPath, './.vscode/pystubs', vscode.ConfigurationTarget.Workspace);
  }

  /**
   * @param newPath directory containing .pyi stub file(s)
   */
  public async addDynamicStubPath(newPath: string) {
    this.outputChannel.appendLine('not implemented');
  }

  public async addAllExistingPluginStubs(ignoredDirsPattern: string) {
    this.outputChannel.appendLine('not implemented');
  }
}
