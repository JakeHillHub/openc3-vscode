import * as vscode from 'vscode';

import { CosmosCmdTlmDB } from './cosmos/cmdTlm';
import { EditorFileManager, extensionShouldLoad, ensureVscodeSettings } from './editorFileManager';
import { PythonStubManager } from './cosmos/pythonStubManager';
import { GitIgnoreManager } from './gitIgnoreManager';

import { CosmosConfigurationCompletion } from './completions/cosmosConfigurationCompletion';

import { createCmdTlmCompletions } from './completions/cosmosCmdTlmCompletion';
import { createTargetCompletions } from './completions/cosmosTargetCompletion';
import { createPluginCompletions } from './completions/cosmosPluginCompletion';

import {
  createPyScriptCompletions,
  createRbScriptCompletions,
} from './completions/scriptCompletionDefinitions';

const cleanupResources = new Array<vscode.Disposable>();

function createCompletionProvider(
  outputChannel: vscode.OutputChannel,
  language: string,
  factory: (outputChannel: vscode.OutputChannel) => CosmosConfigurationCompletion
): vscode.Disposable {
  const completions = factory(outputChannel);
  const provider = vscode.languages.registerCompletionItemProvider(
    language,
    completions,
    ...completions.getTriggerChars()
  );
  return provider;
}

function createCosmosCompletionProviders(outputChannel: vscode.OutputChannel): vscode.Disposable[] {
  const cmdtlm = createCompletionProvider(outputChannel, 'openc3-cmdtlm', createCmdTlmCompletions);
  const targets = createCompletionProvider(outputChannel, 'openc3-target', createTargetCompletions);
  const plugins = createCompletionProvider(outputChannel, 'openc3-plugin', createPluginCompletions);

  return [cmdtlm, targets, plugins];
}

export async function activate(context: vscode.ExtensionContext) {
  const shouldLoad = await extensionShouldLoad();
  if (!shouldLoad) {
    vscode.window.showInformationMessage(
      'OpenC3 extension deactivated, workspace is not an openc3 project'
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

  const pyComplete = createPyScriptCompletions(outputChannel, cmdTlmDB);
  const pyScriptProvider = vscode.languages.registerCompletionItemProvider(
    [pyComplete.language],
    pyComplete,
    ...pyComplete.triggerChars
  );

  const rbComplete = createRbScriptCompletions(outputChannel, cmdTlmDB);
  const rbScriptProvider = vscode.languages.registerCompletionItemProvider(
    [rbComplete.language],
    rbComplete,
    ...rbComplete.triggerChars
  );

  const editorFileWatchers = editorFileManager.createOpenC3Watchers(cmdTlmDB);
  const erbViewCmd = editorFileManager.createERBViewCommand();

  subscribe(
    erbViewCmd,

    pyScriptProvider,
    rbScriptProvider,

    ...pyComplete.additionalSubscriptions,
    ...editorFileWatchers,
    ...pythonStubManager.createSubscriptions(),
    ...createCosmosCompletionProviders(outputChannel)
  );

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
        await pythonStubManager.configureHiddenStubs();

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
