import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { PythonCompletionProvider } from './pythonCompletion';
import { CosmosApiCompletionProvider } from './cosmosApiSuggestions';
import { CosmosCmdTlmDB } from './cosmos/cmdTlm';
import { CosmosProjectSearch } from './cosmos/config';

const outputChannel = vscode.window.createOutputChannel('OpenC3 Scripting');

async function filenamesExist(dir: string, options: string[]): Promise<boolean> {
  async function search(currentDir: string): Promise<boolean> {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await search(fullPath); // Recursively search subdirectories
      }

      for (const option of options) {
        if (entry.name === option) {
          return true;
        }
      }
    }

    return false;
  }

  return await search(dir);
}

async function preFlightChecks(): Promise<boolean> {
  /* Verify that this extension should actually activate based on cosmos project commonly found files */
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return false; /* No directory opened, nothing to do */
  }

  for (const folder of workspaceFolders) {
    if (
      await filenamesExist(folder.uri.fsPath, [
        'cmd.txt' /* If none of these are present, probably not a cosmos project */,
        'tlm.txt',
        'openc3-erb.json',
        'plugin.txt',
      ])
    ) {
      return true;
    }
  }

  return false;
}

async function createTypeStubs() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return;
  }

  const stubDir = path.join(workspaceFolder.uri.fsPath, '.vscode', 'pystubs');
  if (!fs.existsSync(stubDir)) {
    fs.mkdirSync(stubDir, { recursive: true });
  }

  const stubSrc = path.resolve(__dirname, 'cosmos_globals.pyi');
  fs.copyFileSync(stubSrc, path.join(stubDir, '__builtins__.pyi'));
}

async function updateWorkspaceSettings() {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return;
  }

  const cfgFilePath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'settings.json');
  if (!fs.existsSync(cfgFilePath)) {
    const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
    fs.mkdirSync(vscodeDir, { recursive: true });
    fs.writeFileSync(cfgFilePath, '{}');
  }

  const config = vscode.workspace.getConfiguration();
  const settingPath = 'python.analysis.stubPath';
  await config.update(settingPath, './.vscode/pystubs', vscode.ConfigurationTarget.Workspace);
  vscode.window.showInformationMessage('COSMOS type definitions configured for this workspace.');
}

class ContentStore {
  private static content = new Map<string, string>();

  public static set(key: string, value: string) {
    this.content.set(key, value);
  }

  public static get(key: string): string {
    return this.content.get(key) || '';
  }

  public static remove(key: string) {
    this.content.delete(key);
  }
}

class ParsedContentProvider implements vscode.TextDocumentContentProvider {
  // This is the custom URI scheme
  public static readonly scheme = 'parsed-result';

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  public readonly onDidChange = this._onDidChange.event;

  public provideTextDocumentContent(uri: vscode.Uri): string {
    return ContentStore.get(uri.fsPath);
  }

  public update(uri: vscode.Uri, content: string) {
    ContentStore.set(uri.path, content);
    this._onDidChange.fire(uri);
  }
}

const parsedContentProvider = new ParsedContentProvider();

async function showParsedERB(filePath: string) {
  try {
    const csearch = new CosmosProjectSearch(outputChannel);
    const parsedResult = await csearch.getERBParseResult(filePath);
    const fileName = path.basename(filePath);
    const key = `erb-${fileName}`;

    ContentStore.set(key, parsedResult);
    const uri = vscode.Uri.parse(`${ParsedContentProvider.scheme}:${key}`);
    const newDoc = await vscode.workspace.openTextDocument(uri);
    parsedContentProvider.update(uri, parsedResult);
    await vscode.window.showTextDocument(newDoc, vscode.ViewColumn.Beside, true);
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to parse ERB within file: ${err}`);
  }
}

async function showParsedERBIfOpen(filePath: string) {
  const key = `erb-${path.basename(filePath)}`;
  const uri = vscode.Uri.parse(`${ParsedContentProvider.scheme}:${key}`);

  const isDocumentOpen = vscode.window.visibleTextEditors.some(
    (editor) => editor.document.uri.toString() === uri.toString()
  );

  if (isDocumentOpen) {
    showParsedERB(filePath);
  }
}

export async function activate(context: vscode.ExtensionContext) {
  if (!(await preFlightChecks())) {
    outputChannel.appendLine('Extension not starting, not a cosmos/openc3 project');
    return; /* Extension does not need to do anything */
  }

  await createTypeStubs();
  await updateWorkspaceSettings();

  const cmdTlmDB = new CosmosCmdTlmDB(outputChannel);
  cmdTlmDB.compileWorkspace();

  outputChannel.show(true);

  /* Watchers */
  const cmdDBListener = vscode.workspace.createFileSystemWatcher('**/cmd.txt');
  cmdDBListener.onDidChange(async (uri) => {
    cmdTlmDB.compileCmdFile(uri.fsPath);
    await showParsedERBIfOpen(uri.fsPath); /* Update ERB View Pane */
  });
  cmdDBListener.onDidCreate((uri) => cmdTlmDB.compileCmdFile(uri.fsPath));

  const tlmDBListener = vscode.workspace.createFileSystemWatcher('**/tlm.txt');
  tlmDBListener.onDidChange((uri) => outputChannel.appendLine(`uri ${uri}`));
  tlmDBListener.onDidCreate((uri) => outputChannel.appendLine(`uri ${uri}`));

  const pluginListener = vscode.workspace.createFileSystemWatcher('**/plugin.txt');
  pluginListener.onDidChange(async (uri) => await showParsedERBIfOpen(uri.fsPath));

  const pythonProvider = vscode.languages.registerCompletionItemProvider(
    ['python'],
    new PythonCompletionProvider(cmdTlmDB, outputChannel),
    '(',
    ',',
    ' '
  );

  const cosmosApiProvider = vscode.languages.registerCompletionItemProvider(
    ['python', 'ruby'],
    new CosmosApiCompletionProvider()
  );

  const showERBCmd = vscode.commands.registerCommand('openc3.showERB', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor.');
      return;
    }

    const document = editor.document;
    await showParsedERB(document.uri.fsPath);
  });

  context.subscriptions.push(
    pythonProvider,
    cosmosApiProvider,
    cmdDBListener,
    tlmDBListener,
    pluginListener,
    showERBCmd,
    vscode.workspace.registerTextDocumentContentProvider(
      ParsedContentProvider.scheme,
      parsedContentProvider
    )
  );
}

export function deactivate() {}
