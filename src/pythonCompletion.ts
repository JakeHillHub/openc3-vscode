import * as vscode from 'vscode';
import {
  CosmosCmdTlmDB,
  CmdParamType,
  CmdArgument,
  argHasEnum,
  getArgEnumKey,
  TlmFieldType,
} from './cosmos/cmdTlm';
import { json } from 'stream/consumers';

/* Most commands */
const cmdPrefixRegex =
  /.*?(?:cmd|cmd_no_range_check|cmd_no_hazardous_check|cmd_no_checks|cmd_raw|cmd_raw_no_range_check|cmd_raw_no_hazardous_check|cmd_raw_no_checks)\((.*)\)?/;

/* Specific requests for a specific field within a packet and target */
const tlmPacketFieldPrefixRegex = /.*?(?:tlm|tlm_raw|tlm_formatted|tlm_with_units)\((.*)\)?/;

function stripQuotes(str: string): string {
  return str.trim().replace(/['"]/g, '');
}

function newFieldCompletion(label: string, text: string, detail: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Field);
  item.insertText = text;
  item.detail = detail;
  return item;
}

function newMethodCompletion(label: string, text: string, detail: string): vscode.CompletionItem {
  const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Method);
  item.insertText = text;
  item.detail = detail;
  return item;
}

function newKwargCompletion(label: string, key: string, value: any): vscode.CompletionItem {
  const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Field);
  item.detail = value;

  let formattedValue = JSON.stringify(value);
  const snippetString = `${key}=\${1:${formattedValue}}$0`;
  item.insertText = new vscode.SnippetString(snippetString);
  return item;
}

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

    const cmdMatch = linePrefix.match(cmdPrefixRegex);
    if (cmdMatch) {
      return this.getCmdCompletions(linePrefix);
    }

    const tlmPacketOnlyMatch = linePrefix.match(tlmPacketFieldPrefixRegex);
    if (tlmPacketOnlyMatch) {
      return this.getTlmPacketFieldCompletions(linePrefix);
    }

    const credMatch = linePrefix.match(/.*?(?:extension_credit)\((.*)\)?/);
    if (credMatch) {
      return [newFieldCompletion('Created By', '"Jake Hill"', 'September 2025')];
    }

    return undefined;
  }

  private parseArgs(argString: string): string[] {
    const args: string[] = [];
    let currentArg = '';
    let braceDepth = 0;
    let inDoubleQuotes = false;

    for (const char of argString) {
      if (char === '"') {
        inDoubleQuotes = !inDoubleQuotes;
      }

      if (!inDoubleQuotes) {
        if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
        }
      }

      if (char === ',' && braceDepth === 0 && !inDoubleQuotes) {
        args.push(currentArg.trim());
        currentArg = '';
      } else {
        currentArg += char;
      }
    }
    args.push(currentArg.trim()); // Add the last argument

    return args;
  }

  private getCmdCompletions(linePrefix: string): vscode.ProviderResult<vscode.CompletionItem[]> {
    const argumentMatch = linePrefix.match(cmdPrefixRegex);
    if (!argumentMatch) {
      return undefined;
    }

    const args = this.parseArgs(argumentMatch[1]);
    const currentArgIndex = args.length - 1;

    let targetName = undefined;
    let commandName = undefined;

    switch (currentArgIndex) {
      case 0:
        return this.getCmdTargets();
      case 1:
        targetName = stripQuotes(args[0]);
        return this.getCommandsForTarget(targetName);
      case 2:
        targetName = stripQuotes(args[0]);
        commandName = stripQuotes(args[1]);

        const paramsString = args[2] || '';
        const existingArgs = [];

        const keyRegex = /['"]([^'"]+)['"]\s*:/g;
        let match;
        while ((match = keyRegex.exec(paramsString)) !== null) {
          existingArgs.push(match[1]);
        }

        const parameterSuggestions = this.getParametersForCmd(
          targetName,
          commandName,
          existingArgs
        );
        if (!parameterSuggestions || parameterSuggestions.length === 0) {
          return undefined;
        }

        const dictionaryStarted = paramsString.trim().startsWith('{');
        if (!dictionaryStarted) {
          parameterSuggestions.forEach((item) => {
            if (item.insertText instanceof vscode.SnippetString) {
              item.insertText = new vscode.SnippetString('{' + item.insertText.value + '}');
            }
          });
        }

        return parameterSuggestions;
    }

    return undefined;
  }

  private getTlmPacketFieldCompletions(
    linePrefix: string
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const argumentMatch = linePrefix.match(tlmPacketFieldPrefixRegex);
    if (!argumentMatch) {
      return undefined;
    }

    const args = this.parseArgs(argumentMatch[1]);
    const currentArgIndex = args.length - 1;

    let targetName = undefined;
    let packetName = undefined;

    switch (currentArgIndex) {
      case 0:
        return this.getTlmTargets();
      case 1:
        targetName = stripQuotes(args[0]);
        return this.getPacketsForTarget(targetName);
      case 2:
        targetName = stripQuotes(args[0]);
        packetName = stripQuotes(args[1]);
        return this.getFieldsForPacket(targetName, packetName);
      case 3:
        const tlmOnly = /.*?tlm\(.*?/; /* Only allow the tlm() cmd, not tlm_raw etc. */
        if (linePrefix.match(tlmOnly)) {
          return this.getFieldTypeCompletions();
        }
      default:
        return undefined;
    }
  }

  private getCmdTargets(): vscode.CompletionItem[] {
    const targetCompletionItems = [];
    for (const targetName of this.cmdTlmDB.getCmdTargets()) {
      targetCompletionItems.push(
        newFieldCompletion(targetName, `"${targetName}"`, `COSMOS Target ${targetName}`)
      );
    }
    return targetCompletionItems;
  }

  private getTlmTargets(): vscode.CompletionItem[] {
    const targetCompletionItems = [];
    for (const targetName of this.cmdTlmDB.getTlmTargets()) {
      targetCompletionItems.push(
        newFieldCompletion(targetName, `"${targetName}"`, `COSMOS Target ${targetName}`)
      );
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
      commandCompletionItems.push(
        newMethodCompletion(cmdId, `"${cmdId}"`, cmdDefinition.description)
      );
    }
    return commandCompletionItems;
  }

  private getPacketsForTarget(targetName: string | undefined): vscode.CompletionItem[] {
    if (targetName === undefined) {
      return [];
    }

    const packets = this.cmdTlmDB.getTargetPackets(targetName);
    if (!packets) {
      return [];
    }

    const packetCompletionItems = [];
    for (const [packetId, packetDefinition] of packets.entries()) {
      packetCompletionItems.push(
        newMethodCompletion(packetId, `"${packetId}"`, packetDefinition.description)
      );
    }
    return packetCompletionItems;
  }

  private getFieldsForPacket(
    targetName: string | undefined,
    packetName: string | undefined
  ): vscode.CompletionItem[] {
    if (targetName === undefined || packetName === undefined) {
      return [];
    }

    const packet = this.cmdTlmDB.getTargetPacket(targetName, packetName);
    if (packet === undefined) {
      return [];
    }

    const fieldCompletionItems = [];
    for (const field of packet.fields) {
      if (field.fieldType === TlmFieldType.ID_ITEM) {
        continue;
      }

      const item = new vscode.CompletionItem(field.name, vscode.CompletionItemKind.Method);
      item.insertText = `"${field.name}"`;
      item.detail = field.description;
      fieldCompletionItems.push(item);
    }
    return fieldCompletionItems;
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

      snippetString = `"${arg.name}": \${1|${choiceString}|}$0`;
    } else {
      if (arg.defaultValue === undefined || arg.defaultValue === null) {
        snippetString = `"${arg.name}": $1$0`;
      } else {
        const formattedDefault = JSON.stringify(arg.defaultValue);
        snippetString = `"${arg.name}": \${1:${formattedDefault}}$0`;
      }
    }

    item.insertText = new vscode.SnippetString(snippetString);
    return item;
  }

  private getParametersForCmd(
    targetName: string,
    commandName: string,
    existingArgs: Array<string>
  ): vscode.CompletionItem[] | undefined | null {
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

  private getFieldTypeCompletions(): vscode.CompletionItem[] {
    const options = ['RAW', 'CONVERTED', 'FORMATTED', 'WITH_UNITS'];
    const typeCompletionItems = [];
    for (const opt of options) {
      typeCompletionItems.push(newKwargCompletion(opt, 'type', opt));
    }
    return typeCompletionItems;
  }
}
