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
const TELEMETRY_KEYWD = 'TELEMETRY';

export enum CmdParamType {
  PARAMETER,
  ID_PARAMETER,
  ARRAY_PARAMETER,
}

export enum TlmFieldType {
  ITEM,
  ID_ITEM,
  ARRAY_ITEM,
}

enum DataType {
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

interface CmdTlmResources {
  erb: CosmosERBConfig;
  targets: Array<string>;
  plugin: CosmosPluginConfig;
  pluginDirectory: string;
  pluginName: string;
}

export interface CmdArgument {
  endianness: Endianness;
  name: string;
  dataType: DataType;
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

interface CmdDeclaration {
  target: string;
  name: string;
  endianness: Endianness;
  description: string | undefined;
}

/* We completely ignore bit offsets/bit sizes since they are irrelevant for suggestions.
   Syntax errors with bit sizes/offsets are therfore not detectable by this module.

   ENTER THE REGEX LABRYNTH COWARD!
*/
const cmdDeclarationRegex =
  /^COMMAND\s+(\S+)\s+(\S+)\s+(BIG_ENDIAN|LITTLE_ENDIAN)(?:(?:\s+"(.+)"))?$/;
const cmdParamRegex =
  /^((?:APPEND_)?(?:PARAMETER|ID_PARAMETER))\s+(\S+).*?(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)\s+(.*)$/;
const cmdBaseTypeRegex =
  /^((?:(?:MIN_|MAX_)(?:UINT|INT|FLOAT)(?:128|64|32|16|8))|(?:-?(?:0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?)))\s+((?:(?:MIN_|MAX_)(?:UINT|INT|FLOAT)(?:128|64|32|16|8))|(?:-?(?:0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?)))\s+((?:(?:MIN_|MAX_)(?:UINT|INT|FLOAT)(?:128|64|32|16|8))|(?:-?(?:0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?)))(?:\s+"(.*?)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const cmdStringValRegex = /^"(.*?)"(?:\s+"(.*?)")?(?:\s+((?:BIG|LITTLE)_ENDIAN))?$/;
const cmdParamArrayRegex =
  /^((?:APPEND_)(?:ARRAY_PARAMETER))\s+(\S+)\s+.*?(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)(?:\s+"(.*)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const cmdArrayValRegex = /^(?:\s+"(.*)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const cmdStateRegex = /^STATE\s+"?([^"]+)"?\s+((?:0x[0-9a-fA-F]+)|(?:\d+))/;

const tlmDeclarationRegex =
  /^TELEMETRY\s+(\S+)\s+(\S+)\s+(BIG_ENDIAN|LITTLE_ENDIAN)(?:(?:\s+"(.+)"))?$/;
const tlmFieldRegex =
  /^(?:(?:APPEND_)?(?:ITEM))\s+(\S+).*?(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)(?:(?:\s+"(.+)"))?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const tlmIdFieldRegex =
  /^(?:(?:APPEND_)?(?:ID_ITEM))\s+(\S+).*?(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)\s+((?:-?(?:0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?))|"([^"]+)")(?:\s+"(.*)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const tlmArrayFieldRegex =
  /^(?:(?:APPEND_)?(?:ARRAY_ITEM))\s+(\S+).*?(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)\s+(?:-?(?:0x[0-9a-fA-F]+|\d*\.?\d+(?:[eE][+-]?\d+)?))(?:\s+"([^"]+)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;

class ParserError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function argHasEnum(arg: CmdArgument): boolean {
  return arg.enumValues.size !== 0;
}

export function getArgEnumKey(arg: CmdArgument, value: any) {
  for (const [key, val] of arg.enumValues) {
    if (val === value) {
      return key;
    }
  }
  return undefined;
}

function deriveEndian(endianStr: string | undefined): Endianness | undefined {
  if (endianStr === undefined) {
    return undefined;
  }
  return endianStr === 'BIG_ENDIAN' ? Endianness.BIG : Endianness.LITTLE;
}

function deriveDataType(dataType: string): DataType {
  switch (dataType) {
    case 'UINT':
      return DataType.UINT;
    case 'INT':
      return DataType.INT;
    case 'FLOAT':
      return DataType.FLOAT;
    case 'DERIVED':
      return DataType.DERIVED;
    case 'STRING':
      return DataType.STRING;
    case 'BLOCK':
      return DataType.BLOCK;
    default:
      return DataType.UNKNOWN;
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
    const message = `Syntax error: ${line}`;

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
    const endianness = deriveEndian(endiannessStr);

    return {
      target: target,
      name: name,
      endianness: endianness as Endianness /* Cannot be undefined, required by regex */,
      description: description /* Cannot be undefined, required by regex */,
    };
  }

  private tryMatchRegularParam(line: string): CmdArgument | undefined {
    const match = line.match(cmdParamRegex);
    if (!match) {
      return undefined;
    }

    const [_, ptype, name, dataType, remainder] = match;
    const arg = {
      name: name,
      dataType: deriveDataType(dataType),
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

    if (arg.dataType === DataType.BLOCK || arg.dataType === DataType.STRING) {
      const stringMatch = remainder.match(cmdStringValRegex);
      if (stringMatch) {
        const [_, value, description, endiannessStr] = stringMatch;
        arg.defaultValue = value;
        if (description !== undefined) {
          arg.description = description;
        }
        if (endiannessStr !== undefined) {
          arg.endianness =
            deriveEndian(endiannessStr) || this.currCmdDecl?.endianness || Endianness.LITTLE;
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
        arg.endianness =
          deriveEndian(endiannessStr) || this.currCmdDecl?.endianness || Endianness.LITTLE;
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
      dataType: deriveDataType(dataType),
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
        arg.endianness =
          deriveEndian(endiannessStr) || this.currCmdDecl?.endianness || Endianness.LITTLE;
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

    const parsedInt = parseInt(stateValue);
    if (!isNaN(parsedInt)) {
      currParam.enumValues.set(stateKey, parsedInt);
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
        if (line.includes('PARAMETER')) {
          this.parserState = CmdParserState.CMD_BODY_PARAM;
          this.parseLine(line, targetName);
          return;
        }
        if (line.startsWith(COMMAND_KEYWD)) {
          this.storeBufferedCmdDef(targetName);
          this.parserState = CmdParserState.CMD_DECL;
          this.parseLine(line, targetName);
          return;
        }
        this.updateParamMeta(line);
        break;
      default:
        break;
    }
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

    const lines = erbResult.split(/\r?\n/);

    for (const line of lines) {
      this.lineNumber++;
      const sanitized = line.trim();
      if (sanitized === '' || sanitized.startsWith('#')) {
        continue; /* Ignore empty lines + comments */
      }

      try {
        this.parseLine(sanitized, targetName);
      } catch (err) {
        if (err instanceof ParserError) {
          this.outputChannel.appendLine(`cmd parser error: ${err}`);
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

enum TlmParserState {
  PACKET_DECL,
  PACKET_BODY_FIELD,
  PACKET_FIELD_META,
}

export interface TlmField {
  endianness: Endianness;
  name: string;
  idValue: string | number;
  dataType: DataType;
  fieldType: TlmFieldType;
  arrayDataType: DataType | undefined;
  description: string;
  enumValues: Map<string, any>;
}

export interface TlmDefinition {
  target: string;
  id: string;
  description: string;
  fields: Array<TlmField>;
}

interface TlmDeclaration {
  target: string;
  name: string;
  endianness: Endianness;
  description: string | undefined;
}

export class TlmFileParser {
  private path: string;
  private outputChannel: vscode.OutputChannel;
  private parserState: TlmParserState = TlmParserState.PACKET_DECL;
  private lineNumber: number = 0;

  private packets: Array<TlmDefinition> = new Array<TlmDefinition>();

  // Stash currently parsing telemetry info in these private vars
  private currTlmDecl: TlmDeclaration | undefined = undefined;
  private currTlmFields: Array<TlmField> = new Array<TlmField>();

  public constructor(filePath: string, outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.path = filePath;
  }

  public getPackets(): Array<TlmDefinition> {
    return this.packets;
  }

  private syntaxError(line: string): ParserError {
    // Log to vscode console then return same message to throw
    const message = `Syntax error: ${line}`;

    this.outputChannel.appendLine(`${this.path}:${this.lineNumber}:1: ${message}`);
    this.outputChannel.show(true);

    return new ParserError(message);
  }

  private searchTlmDecl(line: string): TlmDeclaration | undefined {
    if (!line.startsWith(TELEMETRY_KEYWD)) {
      return undefined; /* Check first to avoid regex parse */
    }

    const match = line.match(tlmDeclarationRegex);
    if (!match) {
      throw this.syntaxError(line);
    }

    const [_, target, name, endiannessStr, description] = match;
    const endianness = deriveEndian(endiannessStr);

    return {
      target: target,
      name: name,
      endianness: endianness || Endianness.LITTLE,
      description: description,
    };
  }

  private tryMatchRegularField(line: string): TlmField | undefined {
    const match = line.match(tlmFieldRegex);
    if (!match) {
      return undefined;
    }

    const [_, fieldName, dataType, description, endianStr] = match;
    return {
      name: fieldName,
      idValue: 0 /* Unused for regular items */,
      dataType: deriveDataType(dataType),
      fieldType: TlmFieldType.ITEM,
      arrayDataType: undefined,
      description: description || fieldName,
      endianness: deriveEndian(endianStr) || this.currTlmDecl?.endianness || Endianness.LITTLE,
      enumValues: new Map<string, any>(),
    };
  }

  private tryMatchIdField(line: string): TlmField | undefined {
    const match = line.match(tlmIdFieldRegex);
    if (!match) {
      return undefined;
    }

    const [_, fieldName, dataType, idNum, idStr, description, endianStr] = match;
    return {
      name: fieldName,
      idValue: idStr || idNum /* Fallback to idNum if idStr is undefined (not a string match) */,
      dataType: deriveDataType(dataType),
      fieldType: TlmFieldType.ID_ITEM,
      arrayDataType: undefined,
      description: description || fieldName,
      endianness: deriveEndian(endianStr) || this.currTlmDecl?.endianness || Endianness.LITTLE,
      enumValues: new Map<string, any>(),
    };
  }

  private tryMatchArrayField(line: string): TlmField | undefined {
    const match = line.match(tlmArrayFieldRegex);
    if (!match) {
      return undefined;
    }

    const [_, fieldName, dataType, description, endianStr] = match;
    return {
      name: fieldName,
      idValue: 0 /* Unused for array items */,
      dataType: deriveDataType(dataType),
      fieldType: TlmFieldType.ARRAY_ITEM,
      arrayDataType: undefined,
      description: description || fieldName,
      endianness: deriveEndian(endianStr) || this.currTlmDecl?.endianness || Endianness.LITTLE,
      enumValues: new Map<string, any>(),
    };
  }

  private searchFieldDecl(line: string): TlmField | undefined {
    const regularField = this.tryMatchRegularField(line);
    if (regularField !== undefined) {
      return regularField;
    }

    const idField = this.tryMatchIdField(line);
    if (idField !== undefined) {
      return idField;
    }

    const arrayField = this.tryMatchArrayField(line);
    if (arrayField !== undefined) {
      return arrayField;
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

  private updateFieldMeta(line: string) {
    const [stateKey, stateValue] = this.tryMatchState(line);
    if (stateKey === undefined) {
      return;
    }

    const currParam = this.currTlmFields.at(-1);
    if (currParam === undefined) {
      return;
    }

    const parsedInt = parseInt(stateValue);
    if (!isNaN(parsedInt)) {
      currParam.enumValues.set(stateKey, parsedInt);
      return;
    }
    currParam.enumValues.set(stateKey, stateValue);
  }

  private storeBufferedTlmDef(targetName: string) {
    if (this.currTlmDecl === undefined) {
      return;
    }

    const tlmDefinition = {
      target: targetName,
      id: this.currTlmDecl.name,
      description: this.currTlmDecl.description || '',
      fields: new Array<TlmField>(),
    };

    for (const param of this.currTlmFields) {
      tlmDefinition.fields.push(param);
    }

    this.packets.push(tlmDefinition);

    this.currTlmDecl = undefined;
    this.currTlmFields = new Array<TlmField>();
  }

  private parseLine(line: string, targetName: string) {
    switch (this.parserState) {
      case TlmParserState.PACKET_DECL:
        const cmdDecl = this.searchTlmDecl(line);
        if (cmdDecl === undefined) {
          break;
        }
        this.currTlmDecl = cmdDecl;
        this.parserState = TlmParserState.PACKET_BODY_FIELD;
        break;
      case TlmParserState.PACKET_BODY_FIELD:
        if (line.startsWith(TELEMETRY_KEYWD)) {
          this.storeBufferedTlmDef(targetName);
          this.parserState = TlmParserState.PACKET_DECL;
          this.parseLine(line, targetName);
          return;
        }
        const param = this.searchFieldDecl(line);
        if (param === undefined) {
          break;
        }
        this.parserState = TlmParserState.PACKET_FIELD_META;
        this.currTlmFields.push(param);
        break;
      case TlmParserState.PACKET_FIELD_META:
        if (line.includes('ITEM')) {
          this.parserState = TlmParserState.PACKET_BODY_FIELD;
          this.parseLine(line, targetName);
          return;
        }
        if (line.startsWith(TELEMETRY_KEYWD)) {
          this.storeBufferedTlmDef(targetName);
          this.parserState = TlmParserState.PACKET_DECL;
          this.parseLine(line, targetName);
          return;
        }
        this.updateFieldMeta(line);
        break;
      default:
        break;
    }
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

    const lines = erbResult.split(/\r?\n/);

    for (const line of lines) {
      this.lineNumber++;
      const sanitized = line.trim();
      if (sanitized === '' || sanitized.startsWith('#')) {
        continue; /* Ignore empty lines + comments */
      }

      try {
        this.parseLine(sanitized, targetName);
      } catch (err) {
        if (err instanceof ParserError) {
          this.outputChannel.appendLine(`tlm parser error: ${err}`);
          this.outputChannel.show(true);
          return;
        }

        this.outputChannel.appendLine(`unexpected error occured ${err}`);
        throw err;
      }
    }

    this.storeBufferedTlmDef(targetName);
  }

  public async parse(resources: CmdTlmResources) {
    const fileContents = fs.readFileSync(this.path, 'utf-8');
    for (const targetName of resources.targets) {
      await this.parseTarget(fileContents, resources, targetName);
    }
  }
}

export class CosmosCmdTlmDB {
  /* Structure end data packet such that target->cmd/tlm->fields/params->metadata */
  private cmdMap: Map<string, Map<string, CmdDefinition>>;
  private tlmMap: Map<string, Map<string, TlmDefinition>>;
  private outputChannel: vscode.OutputChannel;

  public constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.cmdMap = new Map<string, Map<string, CmdDefinition>>();
    this.tlmMap = new Map<string, Map<string, TlmDefinition>>();
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

  public getTargetCmds(targetName: string): Map<string, CmdDefinition> {
    const targetCmds = this.cmdMap.get(targetName);
    if (targetCmds === undefined) {
      return new Map<string, CmdDefinition>();
    }
    return targetCmds;
  }

  public getTargetPackets(targetName: string): Map<string, TlmDefinition> {
    const targetPackets = this.tlmMap.get(targetName);
    if (targetPackets === undefined) {
      return new Map<string, TlmDefinition>();
    }
    return targetPackets;
  }

  public getTargetPacket(targetName: string, packetName: string): TlmDefinition | undefined {
    const targetPackets = this.tlmMap.get(targetName);
    const packet = targetPackets?.get(packetName);
    if (packet === undefined) {
      return undefined;
    }
    return packet;
  }

  public getTargetPacketField(
    targetName: string,
    packetName: string,
    fieldName: string
  ): TlmField | undefined {
    const targetPackets = this.tlmMap.get(targetName);
    const packet = targetPackets?.get(packetName);
    const field = packet?.fields.find((field) => field.name === fieldName);
    return field;
  }

  public deriveTlmFieldDefault(field: TlmField | undefined): any | undefined {
    const dataType = field?.dataType;
    switch (dataType) {
      case DataType.UINT:
        return 0;
      case DataType.INT:
        return 0;
      case DataType.FLOAT:
        return 0.0;
      case DataType.DERIVED:
        return '';
      case DataType.STRING:
        return '';
      case DataType.BLOCK:
        return '';
      default:
        return undefined;
    }
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

  public async compileTlmFile(tlmFilePath: string) {
    const resources = await this.getCmdTlmFileResources(tlmFilePath);

    const parser = new TlmFileParser(tlmFilePath, this.outputChannel);
    await parser.parse(resources);

    for (const packet of parser.getPackets()) {
      let targetTlm = this.tlmMap.get(packet.target);
      if (targetTlm === undefined) {
        this.tlmMap.set(packet.target, new Map<string, TlmDefinition>());
        targetTlm = this.tlmMap.get(packet.target);
      }
      targetTlm?.set(packet.id, packet);
    }
  }

  private async compileCmds(excludePattern: string) {
    // Search for all files named 'cmd.txt' in the workspace.
    const fileUris = await vscode.workspace.findFiles('**/cmd.txt', excludePattern);

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
  }

  private async compileTlm(excludePattern: string) {
    // Search for all files named 'cmd.txt' in the workspace.
    const fileUris = await vscode.workspace.findFiles('**/tlm.txt', excludePattern);

    if (fileUris.length === 0) {
      this.outputChannel.appendLine('No .tlm.txt files found in the workspace.');
      return;
    }

    this.outputChannel.appendLine(`Found ${fileUris.length} telemetry files.`);
    for (const fileUri of fileUris) {
      try {
        this.outputChannel.appendLine(`Compiling: ${fileUri.fsPath}`);
        await this.compileTlmFile(fileUri.fsPath);
      } catch (error) {
        this.outputChannel.appendLine(`Error compiling ${fileUri.fsPath}: ${error}`);
      }
    }
  }

  public async compileWorkspace(excludePattern: string) {
    this.outputChannel.appendLine('Scanning workspace for cmd/tlm definitions');
    await this.compileCmds(excludePattern);
    await this.compileTlm(excludePattern);
    this.outputChannel.appendLine('Compiling workspace complete');
  }
}
