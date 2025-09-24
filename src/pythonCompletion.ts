import * as vscode from 'vscode';
import {
  CosmosCmdTlmDB,
  CmdParamType,
  CmdArgument,
  argHasEnum,
  getArgEnumKey,
} from './cosmos/cmdTlm';

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
      const match = nextArg.match(/(\S+)=(?:\s+)?(.*)/);
      if (!match) {
        continue;
      }
      existingArgs.push(match[1]);
    }

    return this.getParametersForCmd(targetName, commandName, existingArgs);
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
      item.insertText = `"${targetName}"`;
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
      item.insertText = `"${cmdId}"`;
      item.detail = `${cmdDefinition.target}: ${cmdId}`;
      item.documentation = cmdDefinition.description;
      commandCompletionItems.push(item);
    }
    return commandCompletionItems;
  }

  private constructArgItemSuggestion(arg: CmdArgument): vscode.CompletionItem {
    const item = new vscode.CompletionItem(arg.name, vscode.CompletionItemKind.Field);
    item.detail = arg.description;

    let snippetString: string;
    if (argHasEnum(arg) && arg.enumValues) {
      const allEnumKeys = [];
      for (const key of arg.enumValues.keys()) {
        allEnumKeys.push(key);
      }

      const defaultKey =
        arg.defaultValue !== undefined && arg.defaultValue !== null
          ? getArgEnumKey(arg, arg.defaultValue)
          : undefined;

      let sortedKeys = allEnumKeys;
      if (defaultKey) {
        sortedKeys = [defaultKey, ...allEnumKeys.filter((key) => key !== defaultKey)];
      }

      const choiceString = sortedKeys.map((key) => JSON.stringify(key)).join(',');

      snippetString = `${arg.name}=\${1|${choiceString}|}`;
    } else {
      if (arg.defaultValue === undefined || arg.defaultValue === null) {
        snippetString = `${arg.name}=$1`;
      } else {
        const formattedDefault = JSON.stringify(arg.defaultValue);
        snippetString = `${arg.name}=\${1:${formattedDefault}}`;
      }
    }

    item.insertText = new vscode.SnippetString(snippetString);
    return item;
  }

  private getParametersForCmd(
    targetName: string,
    commandName: string,
    existingArgs: Array<string>
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const commands = this.cmdTlmDB.getTargetCmds(targetName);
    if (!commands) {
      return undefined;
    }

    const cmdDefinition = commands.get(commandName);
    if (!cmdDefinition) {
      return undefined;
    }

    const parameterCompletionItems = [];
    for (const param of cmdDefinition.arguments) {
      if (existingArgs.includes(param.name)) {
        continue;
      }

      if (param.paramType === CmdParamType.ID_PARAMETER) {
        continue; /* Ignore ID parameters in suggestions */
      }

      if (param.paramType !== CmdParamType.ARRAY_PARAMETER) {
        const suggestion = this.constructArgItemSuggestion(param);
        if (suggestion !== undefined) {
          parameterCompletionItems.push(suggestion);
        }
      }
    }

    return parameterCompletionItems;
  }
}
