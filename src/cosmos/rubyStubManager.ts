import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { CosmosProjectSearch } from './config';
import { triggerEditorRefresh } from '../utility';
import { PyBuiltinStubManager } from './pythonBuiltinStubManager';

export class PythonStubManager {
  private outputChannel: vscode.OutputChannel;
  private builtinStubManager: PyBuiltinStubManager;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;

    this.builtinStubManager = new PyBuiltinStubManager(outputChannel);
  }

  public getPyStubsIgnore(): string | undefined {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return undefined;
    }
    const stubPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'pystubs');
    return vscode.workspace.asRelativePath(stubPath);
  }

  public async probeLoadUtility(doc: vscode.TextDocument) {
    const contents = doc.getText();
    const loadUtilRegex = /load_utility\(["'](.*?)["']\)/g;
    const matches = contents.match(loadUtilRegex);
    if (!matches) {
      return; /* No load_utility calls */
    }

    const moduleImports = [];
    for (const match of matches) {
      const pathRegex = /(?:load_utility|load)\(["'](.*?)["']\)/;
      const pathMatch = match.match(pathRegex);
      const path = pathMatch?.[1];
      if (!path) {
        continue;
      }

      const modulePath = path.split('/').join('.').replace('\.py', '');
      const importStr = `from ${modulePath} import *`;
      moduleImports.push(importStr);
    }

    if (moduleImports.length > 0) {
      await this.builtinStubManager.setStubIncludes(moduleImports);
      triggerEditorRefresh();
    }
  }

  public createSubscriptions(): vscode.Disposable[] {
    return [
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor) {
          return;
        }

        const fileName = editor.document.fileName;
        if (fileName.endsWith('.py')) {
          this.probeLoadUtility(editor.document);
        }
      }),
      vscode.languages.registerHoverProvider('python', {
        provideHover(document, position, token) {
          const range = document.getWordRangeAtPosition(position, /load_utility\(["'](.*?)["']\)/);
          if (!range) {
            return undefined;
          }

          const fileArg = document.getText(range).match(/load_utility\(["'](.*?)["']\)/)?.[1];
          if (!fileArg) {
            return undefined;
          }

          const modulePath = fileArg.split('/').join('.').replace('\.py', '');

          const content = new vscode.MarkdownString();
          content.isTrusted = true;

          content.appendCodeblock(`from ${modulePath} import *`, 'python');

          return new vscode.Hover(content, range);
        },
      }),
    ];
  }

  /**
   * Run initialization steps to configure workspace properly
   */
  public async initializeStubs(ignoredDirsPattern: string) {
    await this.copyCosmosAPIStubs();
    await this.configureAPIStubs();
    await this.configureDiagnosticSeverity();
    await this.addAllExistingPluginStubs(ignoredDirsPattern);

    setTimeout(() => {
      if (vscode.window.activeTextEditor) {
        const fileName = vscode.window.activeTextEditor.document.fileName;
        if (fileName.endsWith('.py')) {
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

    const hiddenPatterns = ['**/pystubs'];
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
