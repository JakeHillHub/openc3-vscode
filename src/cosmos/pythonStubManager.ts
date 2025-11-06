import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

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
  public async initializeStubs(ignoredDirsPattern: string, context: vscode.ExtensionContext) {
    await this.copyCosmosAPIStubs(context);
    await this.configureAPIStubs(context);
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

  private getStubsPath(context: vscode.ExtensionContext): string | undefined {
    const storageFolder = context.storageUri?.fsPath;
    this.outputChannel.appendLine(`Local storage folder ${storageFolder}`);

    if (storageFolder === undefined) {
      return undefined;
    }

    return path.join(storageFolder, 'pystubs');
  }

  /**
   * Only run once during initialization to refresh/copy builtin stubs for api functions
   */
  private async copyCosmosAPIStubs(context: vscode.ExtensionContext) {
    const stubDir = this.getStubsPath(context);
    if (stubDir === undefined) {
      this.outputChannel.appendLine(`No local storage path, cannot load python/ruby stubs`);
      return;
    }

    const stubSrc = path.resolve(__dirname, 'pystubs');

    await fs.mkdir(stubDir, { recursive: true });
    await fs.cp(stubSrc, stubDir, { recursive: true });
  }

  /**
   * Add API stubs to python analysis configuration
   */
  private async configureAPIStubs(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration();
    const settingPath = 'python.analysis.stubPath';

    const stubDir = this.getStubsPath(context);
    if (stubDir === undefined) {
      this.outputChannel.appendLine(`No local storage path, cannot configure pylance stub path`);
    }
    await config.update(settingPath, stubDir, vscode.ConfigurationTarget.Workspace);
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
