// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PythonCompletionProvider } from './pythonCompletion';
import { CosmosApiCompletionProvider } from './cosmosApiSuggestions';
import { CosmosCmdTlmDB } from './cmdTlmDB';

const outputChannel = vscode.window.createOutputChannel('OpenC3 Scripting');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const cmdTlmDB = new CosmosCmdTlmDB(outputChannel);
  cmdTlmDB.compileWorkspace();

  outputChannel.appendLine(`cmdtlmdb ${cmdTlmDB}`);
  outputChannel.show(true);

  const onDidSave = vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    if (document.fileName.endsWith('cmd.txt') || document.fileName.endsWith('tlm.txt')) {
      cmdTlmDB.compileFile(document);
    }
  });

  const pythonProvider = vscode.languages.registerCompletionItemProvider(
    ['python'],
    new PythonCompletionProvider(cmdTlmDB),
    '(' // This is the trigger character that activates the provider
  );

  const cosmosApiProvider = vscode.languages.registerCompletionItemProvider(
    ['python', 'ruby'],
    new CosmosApiCompletionProvider()
  );

  context.subscriptions.push(pythonProvider, cosmosApiProvider, onDidSave);
}

// This method is called when your extension is deactivated
export function deactivate() {}
