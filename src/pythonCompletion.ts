import * as vscode from 'vscode';
import { CosmosCmdTlmDB, CmdDefinition, TlmDefinition } from './cosmos/cmdTlm';

export class PythonCompletionProvider implements vscode.CompletionItemProvider {
  private cmdTlmDB: CosmosCmdTlmDB;
  private outputChannel: vscode.OutputChannel;

  constructor(cmdTlmDB: CosmosCmdTlmDB, outputChannel: vscode.OutputChannel) {
    this.cmdTlmDB = cmdTlmDB;
    this.outputChannel = outputChannel;
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const linePrefix = document.getText(
      new vscode.Range(position.line, 0, position.line, position.character)
    );

    this.outputChannel.appendLine('provide completion');

    if (linePrefix.includes('cmd(')) {
      return this.getCmdCompletions(linePrefix);
    } else if (linePrefix.includes('tlm(')) {
      return this.getTlmCompletions(linePrefix);
    }

    return undefined;
  }

  private getCmdCompletions(linePrefix: string): vscode.ProviderResult<vscode.CompletionItem[]> {
    const argumentMatch = linePrefix.match(/.*cmd\((.*)\)?/);
    if (!argumentMatch) {
      return undefined;
    }

    const args = argumentMatch[1].split(',');
    const currentArgIndex = args.length - 1;

    if (currentArgIndex === 0) {
      return this.getCmdTargets();
    }

    const targetName = args[0].trim().replace(/['"]/g, '');
    if (!targetName) {
      return undefined;
    }
    if (currentArgIndex === 1) {
      return this.getCommandsForTarget(targetName);
    }

    const commandName = args[1].trim().replace(/['"]/g, '');
    if (!commandName) {
      return undefined;
    }

    const existingArgs = [];
    for (const nextArg of args.slice(2)) {
      const match = nextArg.match(/(\S+):(?:\s+)?(.*)/);
      if (!match) {
        continue;
      }
      const [_, key, __] = match;
      existingArgs.push(key);
    }

    return undefined;
  }

  private getTlmCompletions(linePrefix: string): vscode.ProviderResult<vscode.CompletionItem[]> {
    const argumentMatch = linePrefix.match(/tlm\((.*)\)/);
    if (!argumentMatch) {
      return undefined;
    }

    const args = argumentMatch[1].split(',');
    const currentArgIndex = args.length - 1;

    if (currentArgIndex === 0) {
      // Suggest tlm packet IDs
    }

    return undefined;
  }

  private getCmdTargets(): vscode.CompletionItem[] {
    const targetCompletionItems = [];
    for (const targetName of this.cmdTlmDB.getCmdTargets()) {
      const item = new vscode.CompletionItem(targetName, vscode.CompletionItemKind.Field);
      item.insertText = `'${targetName}'`;
      item.detail = `COSMOS Target ${targetName}`;
      targetCompletionItems.push(item);
    }
    return targetCompletionItems;
  }

  private getCommandsForTarget(targetName: string): vscode.CompletionItem[] {
    const commands = this.cmdTlmDB.getTargetCmds(targetName);
    if (!commands) {
      return [];
    }

    const commandCompletionItems = [];
    for (const [cmdId, cmdDefinition] of commands.entries()) {
      const item = new vscode.CompletionItem(cmdId, vscode.CompletionItemKind.Method);
      item.insertText = `'${cmdId}'`;
      item.detail = `${cmdDefinition.target}: ${cmdId}`;
      item.documentation = cmdDefinition.description;
      commandCompletionItems.push(item);
    }
    return commandCompletionItems;
  }

  private getParametersForCmd(targetName: string, commandName: string) {}
}
