import * as vscode from 'vscode';

import { PythonCompletionProvider } from './completions/pythonCompletionRef';
import { CosmosCmdTlmDB } from './cosmos/cmdTlm';
import { EditorFileManager, extensionShouldLoad, ensureVscodeSettings } from './editorFileManager';
import { PythonStubManager } from './cosmos/pythonStubManager';
import { GitIgnoreManager } from './gitIgnoreManager';
import { UpdateSettingsFlag } from './utility';

import { CosmosConfigurationCompletion } from './completions/cosmosConfigurationCompletion';

import { createCmdCompletions } from './completions/cosmosCmdCompletion';
import { createTlmCompletions } from './completions/cosmosTlmCompletion';
import { createTargetCompletions } from './completions/cosmosTargetCompletion';
import { createPluginCompletions } from './completions/cosmosPluginCompletion';
import {
  createPyScriptCompletions,
  createRbScriptCompletions,
} from './completions/pythonScriptCompletions';

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
  const cmdTxt = createCompletionProvider(outputChannel, 'openc3-cmd', createCmdCompletions);
  const tlmTxt = createCompletionProvider(outputChannel, 'openc3-tlm', createTlmCompletions);
  const targTxt = createCompletionProvider(outputChannel, 'openc3-target', createTargetCompletions);
  const plugTxt = createCompletionProvider(outputChannel, 'openc3-plugin', createPluginCompletions);

  return [cmdTxt, tlmTxt, targTxt, plugTxt];
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

  const updateSettingsFlag = new UpdateSettingsFlag();

  const cmdTlmDB = new CosmosCmdTlmDB(outputChannel);
  const pythonStubManager = new PythonStubManager(outputChannel, updateSettingsFlag);
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
        updateSettingsFlag.set();

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

        updateSettingsFlag.clear();
        return 'OpenC3 initialized';
      }
    );
  };

  await reinitializeExtension();

  const vscodeSettingsWatcher = editorFileManager.createVscodeSettingsWatcher(
    reinitializeExtension,
    updateSettingsFlag
  );
  subscribe(vscodeSettingsWatcher);
}

export function deactivate() {
  for (const disposable of cleanupResources) {
    disposable.dispose();
  }
}
