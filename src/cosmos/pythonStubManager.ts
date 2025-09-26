import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { CosmosProjectSearch } from './config';

export class PythonStubManager {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  public getPyStubsIgnore(): string | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return undefined;
    }
    const stubPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'pystubs');
    return vscode.workspace.asRelativePath(stubPath);
  }

  /**
   * Run initialization steps to configure workspace properly
   */
  public async initializeStubs(ignoredDirsPattern: string) {
    await this.copyCosmosAPIStubs();
    await this.configureAPIStubs();
    await this.configureDiagnosticSeverity();
    await this.addAllExistingPluginStubs(ignoredDirsPattern);
  }

  /**
   * Only run once during initialization to refresh/copy builtin stubs for api functions
   */
  private async copyCosmosAPIStubs() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    const stubDir = path.join(workspaceFolder.uri.fsPath, '.vscode', 'pystubs');
    if (!fs.existsSync(stubDir)) {
      await fs.promises.mkdir(stubDir, { recursive: true });
    }

    const stubSrc = path.resolve(__dirname, 'pystubs');
    await fs.promises.cp(stubSrc, stubDir, { recursive: true });
  }

  /**
   * Add API stubs to python analysis configuration
   */
  private async configureAPIStubs() {
    const config = vscode.workspace.getConfiguration();
    const settingPath = 'python.analysis.stubPath';
    await config.update(settingPath, './.vscode/pystubs', vscode.ConfigurationTarget.Workspace);
  }

  /**
   * Clean up pylance warnings about type only module imports (we have no implementation)
   */
  private async configureDiagnosticSeverity() {
    const config = vscode.workspace.getConfiguration();
    const ignoreMissingSourcePath = 'python.analysis.diagnosticSeverityOverrides';
    await config.update(ignoreMissingSourcePath, {
      reportMissingModuleSource: 'none',
    });
  }

  /**
   * @param newPath directory containing .pyi stub file(s)
   */
  public async addDynamicStubPath(newPath: string) {
    const config = vscode.workspace.getConfiguration();
    const extraPathsSourcePath = 'python.analysis.extraPaths';
    const existingPaths = config.get(extraPathsSourcePath, []);

    /* Run all paths through a set to prevent duplicates */
    const pathSet = new Set<string>();
    for (const p of existingPaths) {
      pathSet.add(p);
    }
    pathSet.add(newPath);

    const pathsOut = [];
    for (const p of pathSet) {
      pathsOut.push(p);
    }
    await config.update(extraPathsSourcePath, pathsOut, vscode.ConfigurationTarget.Workspace);
  }

  public async addAllExistingPluginStubs(ignoredDirsPattern: string) {
    const csearch = new CosmosProjectSearch(this.outputChannel);
    const targetDirs = await csearch.getAllTargetDirs(ignoredDirsPattern, (targPath: string) => {
      return `${path.dirname(vscode.workspace.asRelativePath(targPath))}`;
    });

    for (const stubDir of targetDirs) {
      await this.addDynamicStubPath(stubDir);
    }
  }
}
