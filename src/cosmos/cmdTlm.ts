import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import {
  CosmosPluginConfig,
  CosmosERBConfig as CosmosERBConfig,
  CosmosProjectSearch,
  parseERB,
  TARGET_NAME_ERB_VAR,
} from './config';

const COMMAND_KEYWD = 'COMMAND';

enum CmdParamType {
  PARAMETER,
  ID_PARAMETER,
  ARRAY_PARAMETER,
}

enum CmdParamDataType {
  INT,
  UINT,
  FLOAT,
  DERIVED,
  STRING,
  BLOCK,
  ARRAY,
  UNKNOWN,
}

enum Endianness {
  BIG,
  LITTLE,
}

enum CmdParserState {
  CMD_DECL,
  CMD_BODY_PARAM,
  CMD_PARAM_META,
}

export interface CmdArgument {
  endianness: Endianness;
  name: string;
  dataType: CmdParamDataType;
  paramType: CmdParamType;
  arrayParamType: CmdParamType | undefined;
  description: string;
  minVal: number;
  maxVal: number;
  defaultValue: any;
  enumValues: Map<string, any>;
}

export interface CmdDefinition {
  target: string;
  id: string;
  description: string;
  arguments: Array<CmdArgument>;
}

export interface TlmDefinition {
  id: string;
  description: string;
  fields: string[];
}

interface CmdDeclaration {
  target: string;
  name: string;
  endianness: Endianness;
  description: string | undefined;
}

/* We completely ignore bit offsets/bit sizes since they are irrelevant for command suggestions.
   Syntax errors with bit sizes/offsets are therfore not detectable by this module.
   Will be implemented in the cmd/tlm syntax highlighting portion instead. */
const cmdDeclarationRegex =
  /^COMMAND\s+(\S+)\s+(\S+)\s+(BIG_ENDIAN|LITTLE_ENDIAN)(?:(?:\s+"(.+)"))?$/;

const cmdParamRegex =
  /^((?:APPEND_)?(?:PARAMETER|ID_PARAMETER))\s+(\S+).*(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)\s+(.*)$/;
const cmdBaseTypeRegex =
  /^((?:(?:MIN_|MAX_)(?:UINT|INT|FLOAT)(?:128|64|32|16|8))|(?:-?(?:0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?)))\s+((?:(?:MIN_|MAX_)(?:UINT|INT|FLOAT)(?:128|64|32|16|8))|(?:-?(?:0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?)))\s+((?:(?:MIN_|MAX_)(?:UINT|INT|FLOAT)(?:128|64|32|16|8))|(?:-?(?:0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?)))(?:\s+"(.*?)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const cmdStringValRegex = /^"(.*?)"(?:\s+"(.*?)")?(?:\s+((?:BIG|LITTLE)_ENDIAN))?$/;

const cmdParamArrayRegex =
  /^((?:APPEND_)(?:ARRAY_PARAMETER))\s+(\S+)\s+.*(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)(?:\s+"(.*)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const cmdArrayValRegex = /^(?:\s+"(.*)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const cmdStateRegex = /^STATE\s+"?([^"]+)"?\s+((?:0x[0-9a-fA-F]+)|(?:\d+))$/;

class ParserError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function deriveConstNum(constVal: string): number {
  // Shortcut: Use the unary '+' to handle both integers and floats in one go.
  const num = +constVal;
  if (!isNaN(num)) {
    return num;
  }

  const constExpr = /^(MIN|MAX)_(UINT|INT|FLOAT)(8|16|32|64|128)$/;
  const match = constVal.match(constExpr);

  // If it's not a number and doesn't match the pattern, it's invalid.
  if (!match) {
    return NaN;
  }

  const [, minMax, dataType, sizeBitsStr] = match;
  // Use BigInt for the bit size to perform calculations safely, preventing overflow.
  const sizeBits = BigInt(sizeBitsStr);

  if (dataType === 'UINT') {
    // MIN for any unsigned integer is always 0.
    if (minMax === 'MIN') {
      return 0;
    }
    // MAX for an n-bit unsigned integer is (2^n) - 1.
    return Number(2n ** sizeBits - 1n);
  }

  if (dataType === 'INT') {
    // For signed integers, the range is based on n-1 bits.
    const exp = sizeBits - 1n;
    const limit = 2n ** exp;

    // MIN for an n-bit signed integer is -(2^(n-1)).
    if (minMax === 'MIN') {
      return Number(-limit);
    }
    // MAX for an n-bit signed integer is (2^(n-1)) - 1.
    return Number(limit - 1n);
  }

  // Handle common float types.
  if (dataType === 'FLOAT') {
    if (sizeBitsStr === '64') {
      return minMax === 'MAX' ? Number.MAX_VALUE : -Number.MAX_VALUE;
    }
    if (sizeBitsStr === '32') {
      // These are the known constants for IEEE 754 single-precision.
      return minMax === 'MAX' ? 3.4028235e38 : -3.4028235e38;
    }
  }

  // Return NaN for unhandled cases (e.g., FLOAT8, FLOAT128).
  return NaN;
}

export class CmdFileParser {
  private path: string;
  private outputChannel: vscode.OutputChannel;
  private parserState: CmdParserState = CmdParserState.CMD_DECL;
  private lineNumber: number = 0;

  private commands: Array<CmdDefinition> = new Array<CmdDefinition>();

  // Stash currently parsing command info in these private vars
  private currCmdDecl: CmdDeclaration | undefined = undefined;
  private currCmdParams: Array<CmdArgument> = new Array<CmdArgument>();

  public constructor(filePath: string, outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.path = filePath;
  }

  public getCommands(): Array<CmdDefinition> {
    return this.commands;
  }

  private syntaxError(line: string): ParserError {
    // Log to vscode console then return same message to throw
    const message = `Syntax error: '${line}'`;

    this.outputChannel.appendLine(`${this.path}:${this.lineNumber}:1: ${message}`);
    this.outputChannel.show(true);

    return new ParserError(message);
  }

  private searchCmdDecl(line: string): CmdDeclaration | undefined {
    if (!line.startsWith(COMMAND_KEYWD)) {
      return undefined; /* Check first to avoid regex parse */
    }

    const match = line.match(cmdDeclarationRegex);
    if (!match) {
      throw this.syntaxError(line);
    }

    const [_, target, name, endiannessStr, description] = match;
    const endianness = endiannessStr === 'BIG_ENDIAN' ? Endianness.BIG : Endianness.LITTLE;

    return {
      target: target,
      name: name,
      endianness: endianness,
      description: description,
    };
  }

  private deriveDataType(dataType: string): CmdParamDataType {
    switch (dataType) {
      case 'UINT':
        return CmdParamDataType.UINT;
      case 'INT':
        return CmdParamDataType.INT;
      case 'FLOAT':
        return CmdParamDataType.FLOAT;
      case 'DERIVED':
        return CmdParamDataType.DERIVED;
      case 'STRING':
        return CmdParamDataType.STRING;
      case 'BLOCK':
        return CmdParamDataType.BLOCK;
      default:
        return CmdParamDataType.UNKNOWN;
    }
  }

  private tryMatchRegularParam(line: string): CmdArgument | undefined {
    const match = line.match(cmdParamRegex);
    if (!match) {
      return undefined;
    }

    const [_, ptype, name, dataType, remainder] = match;
    const arg = {
      name: name,
      dataType: this.deriveDataType(dataType),
      paramType: CmdParamType.PARAMETER,
      arrayParamType: undefined,
      description: '' /* Default for now */,
      endianness:
        this.currCmdDecl?.endianness || (Endianness.LITTLE as Endianness) /* Default for now */,
      minVal: 0,
      maxVal: 0,
      defaultValue: 0 as any,
      enumValues: new Map<string, any>(),
    };

    if (ptype.includes('ID')) {
      /* Change to ID type */
      arg.paramType = CmdParamType.ID_PARAMETER;
    }

    if (arg.dataType === CmdParamDataType.BLOCK || arg.dataType === CmdParamDataType.STRING) {
      const stringMatch = remainder.match(cmdStringValRegex);
      if (stringMatch) {
        const [_, value, description, endiannessStr] = stringMatch;
        arg.defaultValue = value;
        if (description !== undefined) {
          arg.description = description;
        }
        if (endiannessStr !== undefined) {
          arg.endianness = 'BIG_ENDIAN' === endiannessStr ? Endianness.BIG : Endianness.LITTLE;
        }
      }

      return arg;
    }

    const definitionMatch = remainder.match(cmdBaseTypeRegex);
    if (definitionMatch) {
      const [_, minVal, maxVal, defaultValue, description, endiannessStr] = definitionMatch;
      arg.minVal = deriveConstNum(minVal); /* Required, cannot be undefined */
      arg.maxVal = deriveConstNum(maxVal);
      arg.defaultValue = deriveConstNum(defaultValue);
      if (description !== undefined) {
        arg.description = description;
      }
      if (endiannessStr !== undefined) {
        arg.endianness = endiannessStr === 'BIG_ENDIAN' ? Endianness.BIG : Endianness.LITTLE;
      }
    }

    return arg;
  }

  private tryMatchArrayParam(line: string): CmdArgument | undefined {
    const match = line.match(cmdParamArrayRegex);
    if (!match) {
      return undefined;
    }

    const [_, __, name, dataType, remainder] = match;

    const arg = {
      name: name,
      dataType: this.deriveDataType(dataType),
      paramType: CmdParamType.ARRAY_PARAMETER,
      arrayParamType: undefined,
      description: '' /* Default for now */,
      endianness:
        this.currCmdDecl?.endianness || (Endianness.LITTLE as Endianness) /* Default for now */,
      minVal: 0,
      maxVal: 0,
      defaultValue: new Array<any>(),
      enumValues: new Map<string, any>(),
    };

    const definitionMatch = remainder.match(cmdArrayValRegex);
    if (definitionMatch) {
      const [_, description, endiannessStr] = definitionMatch;
      if (description !== undefined) {
        arg.description = description;
      }
      if (endiannessStr !== undefined) {
        arg.endianness = 'BIG_ENDIAN' === endiannessStr ? Endianness.BIG : Endianness.LITTLE;
      }
    }

    return arg;
  }

  private searchParamDecl(line: string): CmdArgument | undefined {
    const regularParam = this.tryMatchRegularParam(line);
    if (regularParam !== undefined) {
      return regularParam;
    }

    const arrayParam = this.tryMatchArrayParam(line);
    if (arrayParam !== undefined) {
      return arrayParam;
    }

    return undefined;
  }

  private tryMatchState(line: string): [string | undefined, any] {
    const stateMatch = line.match(cmdStateRegex);
    if (!stateMatch) {
      return [undefined, undefined];
    }

    const [_, key, value] = stateMatch;
    return [key, value];
  }

  private updateParamMeta(line: string) {
    const [stateKey, stateValue] = this.tryMatchState(line);
    if (stateKey === undefined) {
      return;
    }

    const currParam = this.currCmdParams.at(-1);
    if (currParam === undefined) {
      return;
    }

    currParam.enumValues.set(stateKey, stateValue);
  }

  private storeBufferedCmdDef(targetName: string) {
    if (this.currCmdDecl === undefined) {
      return;
    }

    const cmdDefinition = {
      target: targetName,
      id: this.currCmdDecl.name,
      description: this.currCmdDecl.description || '',
      arguments: new Array<CmdArgument>(),
    };

    for (const param of this.currCmdParams) {
      cmdDefinition.arguments.push(param);
    }

    this.commands.push(cmdDefinition);

    this.currCmdDecl = undefined;
    this.currCmdParams = new Array<CmdArgument>();
  }

  private parseLine(line: string, targetName: string) {
    switch (this.parserState) {
      case CmdParserState.CMD_DECL:
        const cmdDecl = this.searchCmdDecl(line);
        if (cmdDecl === undefined) {
          break;
        }
        this.currCmdDecl = cmdDecl;
        this.parserState = CmdParserState.CMD_BODY_PARAM;
        break;
      case CmdParserState.CMD_BODY_PARAM:
        if (line.startsWith(COMMAND_KEYWD)) {
          this.storeBufferedCmdDef(targetName);
          this.parserState = CmdParserState.CMD_DECL;
          this.parseLine(line, targetName);
          return;
        }
        const param = this.searchParamDecl(line);
        if (param === undefined) {
          break;
        }
        this.parserState = CmdParserState.CMD_PARAM_META;
        this.currCmdParams.push(param);
        break;
      case CmdParserState.CMD_PARAM_META:
        if (line.match(/^.*PARAMETER.*$/)) {
          this.parserState = CmdParserState.CMD_BODY_PARAM;
          this.parseLine(line, targetName);
          return;
        }
        if (line.startsWith(COMMAND_KEYWD)) {
          this.parserState = CmdParserState.CMD_DECL;
          this.parseLine(line, targetName);
          return;
        }
        this.updateParamMeta(line);
        break;
      default:
        this.outputChannel.appendLine('default');
        break;
    }
  }

  private sanitizeLine(line: string): string {
    return line.trim();
  }

  private async parseTarget(fileContents: string, resources: CmdTlmResources, targetName: string) {
    const erbValues = new Map<string, string>();
    erbValues.set(TARGET_NAME_ERB_VAR, targetName);
    for (const [key, value] of resources.erb.variables) {
      erbValues.set(key, value);
    }
    await resources.plugin.parse(resources.erb);
    for (const [key, value] of resources.plugin.variables) {
      erbValues.set(key, value);
    }

    let erbResult = undefined;
    try {
      erbResult = await parseERB(fileContents, erbValues);
    } catch (err) {
      this.outputChannel.appendLine(`erb error: ${err}`);
      this.outputChannel.show(true);
      throw err;
    }

    const lines = erbResult.split('\n');

    for (const line of lines) {
      this.lineNumber++;
      const sanitized = this.sanitizeLine(line);
      if (sanitized === '' || sanitized.startsWith('#')) {
        continue; /* Ignore empty lines + comments */
      }

      try {
        this.parseLine(sanitized, targetName);
      } catch (err) {
        if (err instanceof ParserError) {
          this.outputChannel.appendLine(`parser error: ${err}`);
          this.outputChannel.show(true);
          return;
        }

        this.outputChannel.appendLine(`unexpected error occured ${err}`);
        throw err;
      }
    }

    this.storeBufferedCmdDef(targetName);
  }

  public async parse(resources: CmdTlmResources) {
    const fileContents = fs.readFileSync(this.path, 'utf-8');
    for (const targetName of resources.targets) {
      await this.parseTarget(fileContents, resources, targetName);
    }
  }
}

interface CmdTlmResources {
  erb: CosmosERBConfig;
  targets: Array<string>;
  plugin: CosmosPluginConfig;
  pluginDirectory: string;
  pluginName: string;
}

export class CosmosCmdTlmDB {
  private cmdMap: Map<string, Map<string, CmdDefinition>>;
  private tlmMap: Map<string, Map<string, CmdDefinition>>;
  private outputChannel: vscode.OutputChannel;

  public constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.cmdMap = new Map<string, Map<string, CmdDefinition>>();
    this.tlmMap = new Map<string, Map<string, CmdDefinition>>();
  }

  private getMapKeys(map: Map<string, any>): Array<string> {
    const keys = new Array<string>();
    for (const [key, _] of map) {
      keys.push(key);
    }
    return keys;
  }

  public getCmdTargets(): Array<string> {
    return this.getMapKeys(this.cmdMap);
  }

  public getTlmTargets(): Array<string> {
    return this.getMapKeys(this.tlmMap);
  }

  public getTargetCmds(target: string): Map<string, CmdDefinition> {
    const targetCmds = this.cmdMap.get(target);
    if (targetCmds === undefined) {
      return new Map<string, CmdDefinition>();
    }
    return targetCmds;
  }

  public getTargetTlmIds(target: string): Array<string> {
    const targetTlm = this.tlmMap.get(target);
    if (targetTlm === undefined) {
      return new Array<string>();
    }
    return this.getMapKeys(targetTlm);
  }

  private async getCmdTlmFileResources(filePath: string): Promise<CmdTlmResources> {
    const cSearch = new CosmosProjectSearch(this.outputChannel);
    const erbConfig = cSearch.getERBConfig(path.dirname(filePath)); /* Can fail gracefully */

    const [plugin, pluginPath] = cSearch.getPluginConfig(path.dirname(filePath));
    await plugin.parse(erbConfig); /* Can fail gracefully */

    const targets = cSearch.deriveTargetNames(plugin, pluginPath, filePath);

    return {
      erb: erbConfig,
      plugin: plugin,
      targets: targets,
      pluginDirectory: pluginPath,
      pluginName: path.basename(pluginPath),
    };
  }

  public async compileCmdFile(cmdFilePath: string) {
    const resources = await this.getCmdTlmFileResources(cmdFilePath);

    const parser = new CmdFileParser(cmdFilePath, this.outputChannel);
    await parser.parse(resources);

    for (const cmd of parser.getCommands()) {
      let targetCmds = this.cmdMap.get(cmd.target);
      if (targetCmds === undefined) {
        this.cmdMap.set(cmd.target, new Map<string, CmdDefinition>());
        targetCmds = this.cmdMap.get(cmd.target);
      }
      targetCmds?.set(cmd.id, cmd);
    }
  }

  public async compileWorkspace() {
    this.outputChannel.appendLine('Scanning workspace for cmd_tlm folders...');
    // Search for all files named 'cmd.txt' in the workspace.
    const fileUris = await vscode.workspace.findFiles('**/cmd.txt');

    if (fileUris.length === 0) {
      this.outputChannel.appendLine('No .cmd.txt files found in the workspace.');
      return;
    }

    this.outputChannel.appendLine(`Found ${fileUris.length} command files.`);
    for (const fileUri of fileUris) {
      try {
        this.outputChannel.appendLine(`Compiling: ${fileUri.fsPath}`);
        await this.compileCmdFile(fileUri.fsPath);
      } catch (error) {
        this.outputChannel.appendLine(`Error compiling ${fileUri.fsPath}: ${error}`);
      }
    }

    this.outputChannel.appendLine('Compiling workspace complete');
  }
}
