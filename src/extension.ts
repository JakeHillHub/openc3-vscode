import * as vscode from 'vscode';

import { PythonCompletionProvider } from './completions/pythonCompletion';
import { CosmosCmdTlmDB } from './cosmos/cmdTlm';
import { EditorFileManager, extensionShouldLoad, ensureVscodeSettings } from './editorFileManager';
import { PythonStubManager } from './cosmos/pythonStubs';

const cleanupResources = new Array<vscode.Disposable>();

export async function activate(context: vscode.ExtensionContext) {
  const shouldLoad = await extensionShouldLoad();
  if (!shouldLoad) {
    vscode.window.showInformationMessage(
      'OpenC3 extension deactivated, workspace determined to not be a cosmos project'
    );
    return; /* Do nothing - avoid polluting random python repos etc. */
  }

  const outputChannel = vscode.window.createOutputChannel('OpenC3 Scripting');
  const editorFileManager = new EditorFileManager(outputChannel);

  const cmdTlmDB = new CosmosCmdTlmDB(outputChannel);
  const pythonStubManager = new PythonStubManager(outputChannel);

  const triggerChars = ['(', ',', ' ']; /* Chars that trigger python completion */
  const pythonProvider = vscode.languages.registerCompletionItemProvider(
    ['python'],
    new PythonCompletionProvider(cmdTlmDB, outputChannel),
    ...triggerChars
  );

  const editorFileWatchers = editorFileManager.createFileWatchers(cmdTlmDB);

  cleanupResources.push(pythonProvider, ...editorFileWatchers);
  context.subscriptions.push(pythonProvider, ...editorFileWatchers);

  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'OpenC3 extension activated, building contexts...',
      cancellable: false,
    },
    async () => {
      /* Run larger initialization tasks */
      await ensureVscodeSettings();
      await Promise.all([
        cmdTlmDB.compileWorkspace(editorFileManager.getIgnoredDirPattern()),
        pythonStubManager.initializeStubs(),
      ]);

      vscode.window.showInformationMessage(
        'OpenC3 contexts initialized, workspace configuration has been updated'
      );
      return 'OpenC3 initialized';
    }
  );
}

export function deactivate() {
  for (const disposable of cleanupResources) {
    disposable.dispose();
  }
}
