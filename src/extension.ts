import * as vscode from 'vscode';

import { PythonCompletionProvider } from './completions/pythonCompletion';
import { CosmosCmdTlmDB } from './cosmos/cmdTlm';
import { EditorFileManager, extensionShouldLoad, ensureVscodeSettings } from './editorFileManager';
import { PythonStubManager } from './cosmos/pythonStubManager';
import { GitIgnoreManager } from './gitIgnoreManager';

const cleanupResources = new Array<vscode.Disposable>();

export async function activate(context: vscode.ExtensionContext) {
  const shouldLoad = await extensionShouldLoad();
  if (!shouldLoad) {
    vscode.window.showInformationMessage(
      'OpenC3 extension deactivated, workspace determined to not be a cosmos project'
    );
    return; /* Do nothing - avoid polluting random python repos etc. */
  }

  const subscribe = (...disposables: vscode.Disposable[]) => {
    cleanupResources.push(...disposables);
    context.subscriptions.push(...disposables);
  };

  const outputChannel = vscode.window.createOutputChannel('OpenC3 Scripting');
  const editorFileManager = new EditorFileManager(outputChannel);

  const cmdTlmDB = new CosmosCmdTlmDB(outputChannel);
  const pythonStubManager = new PythonStubManager(outputChannel);
  const gitIgnoreManager = new GitIgnoreManager(outputChannel);

  const triggerChars = ['(', ',', ' ']; /* Chars that trigger python completion */
  const pythonProvider = vscode.languages.registerCompletionItemProvider(
    ['python'],
    new PythonCompletionProvider(cmdTlmDB, outputChannel),
    ...triggerChars
  );

  const editorFileWatchers = editorFileManager.createOpenC3Watchers(cmdTlmDB);

  subscribe(pythonProvider, ...editorFileWatchers);

  const reinitializeExtension = async () => {
    /* Run longer running initialization tasks - can be used to rebuild context after settings.json change */
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'OpenC3 extension initializing, building contexts...',
        cancellable: false,
      },
      async () => {
        await ensureVscodeSettings();

        const initialGitIgnorePatterns = [];
        const pyStubsPath = pythonStubManager.getPyStubsIgnore();
        if (pyStubsPath) {
          initialGitIgnorePatterns.push(pyStubsPath);
        }
        await gitIgnoreManager.initializeGitIgnore(...initialGitIgnorePatterns);

        await Promise.all([
          cmdTlmDB.compileWorkspace(editorFileManager.getIgnoredDirPattern()),
          pythonStubManager.initializeStubs(editorFileManager.getIgnoredDirPattern()),
        ]);

        vscode.window.showInformationMessage(
          'OpenC3 contexts initialized, workspace configuration has been updated'
        );
        return 'OpenC3 initialized';
      }
    );
  };

  await reinitializeExtension();

  const vscodeSettingsWatcher =
    editorFileManager.createVscodeSettingsWatcher(reinitializeExtension);
  subscribe(vscodeSettingsWatcher);
}

export function deactivate() {
  for (const disposable of cleanupResources) {
    disposable.dispose();
  }
}
