import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { PythonCompletionProvider } from './pythonCompletion';
import { CosmosCmdTlmDB } from './cosmos/cmdTlm';
import { CosmosProjectSearch } from './cosmos/config';

const outputChannel = vscode.window.createOutputChannel('OpenC3 Scripting');

async function preFlightChecks(excludePattern: string): Promise<boolean> {
  /* Verify that this extension should actually activate based on cosmos project commonly found files */
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return false; /* No directory opened, nothing to do */
  }

  const plugins = await vscode.workspace.findFiles('**/plugin.txt', excludePattern);
  const cmdDefs = await vscode.workspace.findFiles('**/cmd.txt', excludePattern);
  const tlmDefs = await vscode.workspace.findFiles('**/tlm.txt', excludePattern);
  const targets = await vscode.workspace.findFiles('**/target.txt', excludePattern);

  if (
    plugins.length !== 0 &&
    cmdDefs.length !== 0 &&
    tlmDefs.length !== 0 &&
    targets.length !== 0
  ) {
    return true;
  }

  vscode.window.showInformationMessage(
    'OpenC3 extension deactivated, determined workspace to not be a cosmos/openc3 project.'
  );
  return false;
}

async function createTypeStubs() {
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

async function updateWorkspaceSettings(excludePattern: string) {
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
  /* Add stubs path */
  const settingPath = 'python.analysis.stubPath';
  await config.update(settingPath, './.vscode/pystubs', vscode.ConfigurationTarget.Workspace);

  /* Disable missing source for stubs */
  const ignoreMissingSourcePath = 'python.analysis.diagnosticSeverityOverrides';
  await config.update(ignoreMissingSourcePath, {
    reportMissingModuleSource: 'none',
  });

  /* Add plugin roots for load_utility */
  const csearch = new CosmosProjectSearch(outputChannel);
  const targetDirs = await csearch.getAllTargetDirs(excludePattern, (targPath: string) => {
    return `./${path.dirname(vscode.workspace.asRelativePath(targPath))}`;
  });

  const configDirs = [];
  for (const targetDir of targetDirs) {
    configDirs.push(targetDir);
  }

  const extraPathsSourcePath = 'python.analysis.extraPaths';
  await config.update(extraPathsSourcePath, configDirs, vscode.ConfigurationTarget.Workspace);

  vscode.window.showInformationMessage(
    'OpenC3 extension configured pylance type definitions this workspace.'
  );
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

const alwaysIgnore = ['node_modules', '.git', '.vscode'];
function getIgnoredDirectories(): string[] {
  const configuration = vscode.workspace.getConfiguration('openc3');
  const ignoredDirs = configuration.get<string[]>('ignoreDirectories', []);
  for (const dir of alwaysIgnore) {
    ignoredDirs.push(dir);
  }
  return ignoredDirs;
}

function createIgnoreGlobPattern(ignoredDirs: string[]): string {
  if (ignoredDirs.length === 0) {
    return '';
  }

  return `**/{${ignoredDirs.join(',')}}/**`;
}

function isPathIgnored(fsPath: string, ignoredDirs: string[]): boolean {
  if (ignoredDirs.length === 0) {
    return false;
  }

  const normalizedPath = path.normalize(fsPath);
  return ignoredDirs.some((dir) => {
    const pattern = `${path.sep}${dir}${path.sep}`;
    return normalizedPath.includes(pattern);
  });
}

export async function activate(context: vscode.ExtensionContext) {
  const ignoredDirs = getIgnoredDirectories();
  const excludePattern = createIgnoreGlobPattern(ignoredDirs);

  if (!(await preFlightChecks(excludePattern))) {
    outputChannel.appendLine('Extension not starting, not a cosmos/openc3 project');
    return; /* Extension does not need to do anything */
  }

  await createTypeStubs();
  await updateWorkspaceSettings(excludePattern);

  const cmdTlmDB = new CosmosCmdTlmDB(outputChannel);
  cmdTlmDB.compileWorkspace(excludePattern);

  /* Watchers */
  const cmdDBListener = vscode.workspace.createFileSystemWatcher('**/cmd.txt');
  cmdDBListener.onDidChange(async (uri) => {
    if (isPathIgnored(uri.fsPath, ignoredDirs)) {
      return;
    }
    cmdTlmDB.compileCmdFile(uri.fsPath);
    await showParsedERBIfOpen(uri.fsPath); /* Update ERB View Pane */
  });
  cmdDBListener.onDidCreate((uri) => {
    if (isPathIgnored(uri.fsPath, ignoredDirs)) {
      return;
    }
    cmdTlmDB.compileCmdFile(uri.fsPath);
  });

  const tlmDBListener = vscode.workspace.createFileSystemWatcher('**/tlm.txt');
  tlmDBListener.onDidChange(async (uri) => {
    if (isPathIgnored(uri.fsPath, ignoredDirs)) {
      return;
    }
    cmdTlmDB.compileTlmFile(uri.fsPath);
    await showParsedERBIfOpen(uri.fsPath);
  });
  tlmDBListener.onDidCreate((uri) => {
    if (isPathIgnored(uri.fsPath, ignoredDirs)) {
      return;
    }
    cmdTlmDB.compileTlmFile(uri.fsPath);
  });

  const pluginListener = vscode.workspace.createFileSystemWatcher('**/plugin.txt');
  pluginListener.onDidChange(async (uri) => {
    if (isPathIgnored(uri.fsPath, ignoredDirs)) {
      return;
    }
    await showParsedERBIfOpen(uri.fsPath);
  });

  const targetListener = vscode.workspace.createFileSystemWatcher('**/target.txt');
  targetListener.onDidChange(async (uri) => {
    if (isPathIgnored(uri.fsPath, ignoredDirs)) {
      return;
    }
    await showParsedERBIfOpen(uri.fsPath);
  });

  const erbDefListener = vscode.workspace.createFileSystemWatcher('**/openc3-erb.json');
  erbDefListener.onDidChange(async (uri) => {
    if (isPathIgnored(uri.fsPath, ignoredDirs)) {
      return;
    }
    await cmdTlmDB.compileWorkspace(excludePattern);
  });

  const pythonProvider = vscode.languages.registerCompletionItemProvider(
    ['python'],
    new PythonCompletionProvider(cmdTlmDB, outputChannel),
    '(',
    ',',
    ' '
  );

  const showERBCmd = vscode.commands.registerCommand('openc3.showERB', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No active editor.');
      return;
    }

    const document = editor.document;
    if (isPathIgnored(document.uri.fsPath, ignoredDirs)) {
      vscode.window.showInformationMessage(
        'This files directory is ignored by the configured ignore settings'
      );
      return;
    }
    await showParsedERB(document.uri.fsPath);
  });

  context.subscriptions.push(
    pythonProvider,
    cmdDBListener,
    tlmDBListener,
    pluginListener,
    erbDefListener,
    showERBCmd,
    vscode.workspace.registerTextDocumentContentProvider(
      ParsedContentProvider.scheme,
      parsedContentProvider
    )
  );
}

export function deactivate() {}
