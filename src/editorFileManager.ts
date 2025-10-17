/**
 * This module handles extension created files, file watchers, and configuration supporting
 * dynamically created extension files and user created files.
 * @module dataUtils
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

import { CosmosCmdTlmDB } from './cosmos/cmdTlm';
import { CosmosProjectSearch } from './cosmos/config';
import { debounce, UpdateSettingsFlag } from './utility';

const debounceInterval = 100; /* Avoid file updates within this interval, milliseconds */
const alwaysIgnoreDirectories = ['node_modules', '.git', '.vscode'];

/**
 * Use a narrow set of filenames that would likely not ALL
 * exist outside of cosmos project context
 * @returns {Promise<boolean>} Whether or not the extension should load
 */
export async function extensionShouldLoad(): Promise<boolean> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return false; /* No directory opened, nothing to do */
  }

  const plugins = await vscode.workspace.findFiles('**/plugin.txt');
  const rakefiles = await vscode.workspace.findFiles('**/Rakefile');

  if (plugins.length !== 0 && rakefiles.length !== 0) {
    return true;
  }

  return false;
}

/**
 * Ensure we have a .vscode folder with a settings.json file if there isn't one already
 * @returns {Promise<boolean>} did we create a new settings.json file?
 */
export async function ensureVscodeSettings(): Promise<boolean> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return false;
  }

  const cfgFilePath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'settings.json');
  try {
    await fs.access(cfgFilePath); /* Test if cfgFile exists */
    return false;
  } catch (err) {
    const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
    await fs.mkdir(vscodeDir, { recursive: true });
    await fs.writeFile(cfgFilePath, '{}');
    return true;
  }
}

class ParsedContentStore {
  private content = new Map<string, string>();

  public set(key: string, value: string) {
    this.content.set(key, value);
  }

  public get(key: string): string {
    return this.content.get(key) || '';
  }

  public remove(key: string) {
    this.content.delete(key);
  }
}

class ParsedContentProvider implements vscode.TextDocumentContentProvider {
  public static readonly scheme = 'parsed-result';
  private contentStore: ParsedContentStore;

  constructor(contentStore: ParsedContentStore) {
    this.contentStore = contentStore;
  }

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  public readonly onDidChange = this._onDidChange.event;

  public provideTextDocumentContent(uri: vscode.Uri): string {
    return this.contentStore.get(uri.fsPath);
  }

  public update(uri: vscode.Uri, content: string) {
    this.contentStore.set(uri.path, content);
    this._onDidChange.fire(uri);
  }
}

export class EditorFileManager {
  private contentStore: ParsedContentStore;
  private parsedContentProvider: ParsedContentProvider;
  private ignoredDirs: string[];
  private ignoredPattern: string;

  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    const configuration = vscode.workspace.getConfiguration('openc3');
    const ignoredDirs = configuration.get<string[]>('ignoreDirectories', []);
    for (const dir of alwaysIgnoreDirectories) {
      ignoredDirs.push(dir);
    }

    this.ignoredDirs = ignoredDirs;
    this.ignoredPattern = `**/{${ignoredDirs.join(',')}}/**`;

    this.contentStore = new ParsedContentStore();
    this.parsedContentProvider = new ParsedContentProvider(this.contentStore);

    this.outputChannel = outputChannel;
  }

  public getIgnoredDirPattern() {
    return this.ignoredPattern;
  }

  private async showParsedERB(filePath: string) {
    try {
      const csearch = new CosmosProjectSearch(this.outputChannel);
      const parsedResult = await csearch.getERBParseResult(filePath);
      const fileName = path.basename(filePath);
      const key = `erb-${fileName}`;

      this.contentStore.set(key, parsedResult);
      const uri = vscode.Uri.parse(`${ParsedContentProvider.scheme}:${key}`);
      const newDoc = await vscode.workspace.openTextDocument(uri);
      this.parsedContentProvider.update(uri, parsedResult);
      await vscode.window.showTextDocument(newDoc, vscode.ViewColumn.Beside, true);
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to parse ERB within file: ${err}`);
    }
  }

  private async showParsedERBIfOpen(filePath: string) {
    const key = `erb-${path.basename(filePath)}`;
    const uri = vscode.Uri.parse(`${ParsedContentProvider.scheme}:${key}`);

    const isDocumentOpen = vscode.window.visibleTextEditors.some(
      (editor) => editor.document.uri.toString() === uri.toString()
    );

    if (isDocumentOpen) {
      this.showParsedERB(filePath);
    }
  }

  private isPathIgnored(fsPath: string, ignoredDirs: string[]): boolean {
    if (ignoredDirs.length === 0) {
      return false;
    }

    const normalizedPath = path.normalize(fsPath);
    return ignoredDirs.some((dir) => {
      const pattern = `${path.sep}${dir}${path.sep}`;
      return normalizedPath.includes(pattern);
    });
  }

  public createERBViewCommand(): vscode.Disposable {
    const showERBCmd = vscode.commands.registerCommand('openc3.showERB', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor.');
        return;
      }

      const document = editor.document;
      if (this.isPathIgnored(document.uri.fsPath, this.ignoredDirs)) {
        vscode.window.showInformationMessage(
          'This files directory is ignored by the configured ignore settings'
        );
        return;
      }
      await this.showParsedERB(document.uri.fsPath);
    });

    return showERBCmd;
  }

  public createOpenC3Watchers(cmdTlmDB: CosmosCmdTlmDB): vscode.Disposable[] {
    /* Watchers */
    const cosmosCmdTlmWatcher = vscode.workspace.createFileSystemWatcher('**/cmd_tlm/*.txt');
    const erbConfigWatcher = vscode.workspace.createFileSystemWatcher('**/openc3-erb.json');
    const cosmosConfigWatcher = vscode.workspace.createFileSystemWatcher(
      '**/{plugin.txt,target.txt'
    );

    const displayErbIfOpen = async (uri: vscode.Uri) => {
      const fileName = path.basename(uri.fsPath);
      if (fileName !== 'openc3-erb.json') {
        await this.showParsedERBIfOpen(uri.fsPath);
      }
    };

    cosmosCmdTlmWatcher.onDidChange(
      debounce(async (uri: vscode.Uri) => {
        if (this.isPathIgnored(uri.fsPath, this.ignoredDirs)) {
          return;
        }

        await displayErbIfOpen(uri);

        this.outputChannel.appendLine(`Recompiling ${uri.fsPath}`);

        /* Always compile as both cmd and tlm in case both definitions exist */
        cmdTlmDB.compileCmdFile(uri.fsPath);
        cmdTlmDB.compileTlmFile(uri.fsPath);
      }, debounceInterval)
    );

    erbConfigWatcher.onDidChange(
      debounce(async (uri: vscode.Uri) => {
        if (this.isPathIgnored(uri.fsPath, this.ignoredDirs)) {
          return;
        }

        await displayErbIfOpen(uri);

        const fileName = path.basename(uri.fsPath);
        if (fileName === 'openc3-erb.json') {
          this.outputChannel.appendLine(`Recompiling workspace`);
          await cmdTlmDB.compileWorkspace(this.ignoredPattern);
        }
      }, debounceInterval)
    );

    cosmosConfigWatcher.onDidChange(
      debounce(async (uri: vscode.Uri) => {
        if (this.isPathIgnored(uri.fsPath, this.ignoredDirs)) {
          return;
        }

        await displayErbIfOpen(uri);

        const fileName = path.basename(uri.fsPath);
        if (fileName === 'plugin.txt') {
          this.outputChannel.appendLine(`Recompiling workspace`);
          await cmdTlmDB.compileWorkspace(this.ignoredPattern);
        }
      }, debounceInterval)
    );

    const erbContentProvider = vscode.workspace.registerTextDocumentContentProvider(
      ParsedContentProvider.scheme,
      this.parsedContentProvider
    );

    return [cosmosCmdTlmWatcher, erbContentProvider, erbConfigWatcher, cosmosConfigWatcher];
  }

  public createVscodeSettingsWatcher(
    reinitializeExtension: () => Promise<void>,
    updateSettingsFlag: UpdateSettingsFlag
  ): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(async () => {
      if (updateSettingsFlag.isSet()) {
        return;
      }

      this.outputChannel.appendLine('vscode settings changed');
      await reinitializeExtension();
    });
  }
}
