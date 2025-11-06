import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

export class RubyStubManager {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  private getStubsPath(context: vscode.ExtensionContext): string | undefined {
    const storageFolder = context.storageUri?.fsPath;
    this.outputChannel.appendLine(`Local storage folder ${storageFolder}`);

    if (storageFolder === undefined) {
      return undefined;
    }

    return path.join(storageFolder, 'pystubs');
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
  public async initializeStubs(ignoredDirsPattern: string, context: vscode.ExtensionContext) {
    await this.copyCosmosAPIStubs(context);
    await this.configureAPIStubs(context);
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
  private async copyCosmosAPIStubs(context: vscode.ExtensionContext) {
    const stubDir = this.getStubsPath(context);
    if (stubDir === undefined) {
      this.outputChannel.appendLine(`No local stub dir, cannot copy ruby stubs`);
      return;
    }

    const stubSrc = path.resolve(__dirname, 'rbstubs');
    await fs.cp(stubSrc, stubDir, { recursive: true });
  }

  /**
   * Add API stubs to ruby steep configuration
   */
  private async configureAPIStubs(context: vscode.ExtensionContext) {
    // const config = vscode.workspace.getConfiguration();
    // const settingPath = 'python.analysis.stubPath';
    // await config.update(
    //   settingPath,
    //   './.vscode/pystubs',
    //   vscode.ConfigurationTarget.Workspace
    // );
  }

  /**
   * @param newPath directory containing .pyi stub file(s)
   */
  public async addDynamicStubPath(newPath: string) {
    this.outputChannel.appendLine('Ruby stub not implemented');
  }

  public async addAllExistingPluginStubs(ignoredDirsPattern: string) {
    this.outputChannel.appendLine('Ruby stub not implemented');
  }
}
