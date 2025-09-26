import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { CosmosProjectSearch } from './config';
import { UpdateSettingsFlag } from '../utility';

export class PythonStubManager {
  private outputChannel: vscode.OutputChannel;
  private updateSettingsFlag: UpdateSettingsFlag;

  constructor(outputChannel: vscode.OutputChannel, updateSettingsFlag: UpdateSettingsFlag) {
    this.outputChannel = outputChannel;
    this.updateSettingsFlag = updateSettingsFlag;
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
   * Add hide .pyi to workspace configuration
   */
  public async configureHiddenStubs() {
    const config = vscode.workspace.getConfiguration();
    const hidden = config.get('openc3.autoEditorHide', true);
    const filesExcluded = config.get('files.exclude', {}) as any;

    this.updateSettingsFlag.set();
    const hiddenPatterns = ['**/pystubs', '**/*.pyi'];
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
    this.updateSettingsFlag.clear();
  }

  /**
   * Add API stubs to python analysis configuration
   */
  private async configureAPIStubs() {
    const config = vscode.workspace.getConfiguration();
    const settingPath = 'python.analysis.stubPath';

    this.updateSettingsFlag.set();
    await config.update(settingPath, './.vscode/pystubs', vscode.ConfigurationTarget.Workspace);
    this.updateSettingsFlag.clear();
  }

  /**
   * Clean up pylance warnings about type only module imports (we have no implementation)
   */
  private async configureDiagnosticSeverity() {
    const config = vscode.workspace.getConfiguration();
    const ignoreMissingSourcePath = 'python.analysis.diagnosticSeverityOverrides';
    this.updateSettingsFlag.set();
    await config.update(ignoreMissingSourcePath, {
      reportMissingModuleSource: 'none',
    });
    this.updateSettingsFlag.clear();
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

    this.updateSettingsFlag.set();
    await config.update(extraPathsSourcePath, pathsOut, vscode.ConfigurationTarget.Workspace);
    this.updateSettingsFlag.clear();
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
