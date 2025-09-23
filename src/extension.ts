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

export async function activate(context: vscode.ExtensionContext) {
  if (!(await preFlightChecks())) {
    outputChannel.appendLine('Extension not starting, not a cosmos/openc3 project');
    return; /* Extension does not need to do anything */
  }

  const cmdTlmDB = new CosmosCmdTlmDB(outputChannel);
  cmdTlmDB.compileWorkspace();

  outputChannel.appendLine(`started`);
  outputChannel.show(true);

  /* Watchers */
  const cmdDBListener = vscode.workspace.createFileSystemWatcher('**/cmd.txt');
  cmdDBListener.onDidChange((uri) => cmdTlmDB.compileCmdFile(uri.fsPath));
  cmdDBListener.onDidCreate((uri) => cmdTlmDB.compileCmdFile(uri.fsPath));

  const tlmDBListener = vscode.workspace.createFileSystemWatcher('**/tlm.txt');
  tlmDBListener.onDidChange((uri) => outputChannel.appendLine(`uri ${uri}`));
  tlmDBListener.onDidCreate((uri) => outputChannel.appendLine(`uri ${uri}`));

  const pythonProvider = vscode.languages.registerCompletionItemProvider(
    ['python'],
    new PythonCompletionProvider(cmdTlmDB),
    '('
  );

  const cosmosApiProvider = vscode.languages.registerCompletionItemProvider(
    ['python', 'ruby'],
    new CosmosApiCompletionProvider()
  );

  const showERBCmd = vscode.commands.registerCommand('openc3.showERB', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const document = editor.document;

    const csearch = new CosmosProjectSearch(outputChannel);
    const result = await csearch.getERBParseResult(document.uri.fsPath);

    outputChannel.appendLine(`erb parse result: ${result}`);
  });

  context.subscriptions.push(
    pythonProvider,
    cosmosApiProvider,
    cmdDBListener,
    tlmDBListener,
    showERBCmd
  );
}

export function deactivate() {}
