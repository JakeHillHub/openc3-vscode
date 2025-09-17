// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { PythonCompletionProvider } from './pythonCompletion';
import { CosmosApiCompletionProvider } from './cosmosApiSuggestions';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const pythonProvider = vscode.languages.registerCompletionItemProvider(
        ['python'],
        new PythonCompletionProvider(),
        '(' // This is the trigger character that activates the provider
    );

    const cosmosApiProvider = vscode.languages.registerCompletionItemProvider(
        ['python', 'ruby'],
        new CosmosApiCompletionProvider()
    );

    context.subscriptions.push(pythonProvider);
    context.subscriptions.push(cosmosApiProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
