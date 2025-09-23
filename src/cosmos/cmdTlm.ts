import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import {
  CosmosPluginConfig,
  CosmosERBConfig as CosmosERBConfig,
  CosmosProjectSearch,
  parseERB,
} from './config';

const COMMAND_KEYWD = 'COMMAND';

enum CmdParamType {
  INT,
  UINT,
  FLOAT,
  DERIVED,
  STRING,
  BLOCK,
  ARRAY,
}

enum Endianness {
  BIG,
  LITTLE,
}

enum CmdParserState {
  CMD_DECL,
  CMD_BODY_PARAM,
}

export interface CmdDefinition {
  id: string;
  description: string;
  arguments: string[];
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

interface CmdParameter {
  name: string;
}

/* We completely ignore bit offsets/bit sizes since they are irrelevant for command suggestions.
   Syntax errors with bit sizes/offsets are therfore not detectable by this module.
   Will be implemented in the cmd/tlm syntax highlighting portion instead. */
const cmdDeclarationRegex =
  /^COMMAND\s+(\S+)\s+(\S+)\s+(BIG_ENDIAN|LITTLE_ENDIAN)(?:(?:\s+"(.+)"))?$/;
const cmdParamRegex =
  /^((?:APPEND_)?(PARAMETER|ID_PARAMETER))\s+(\S+).*(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)\s+(.*)$/;
const cmdIntValRegex =
  /^((?:(?:MIN_|MAX_)(UINT|INT|FLOAT)(128|64|32|16|8))|\d+)\s+((?:(?:MIN_|MAX_)(UINT|INT|FLOAT)(128|64|32|16|8))|\d+)\s+((?:(?:MIN_|MAX_)(UINT|INT|FLOAT)(128|64|32|16|8))|\d+)(?:\s+"(.*?)")(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;
const cmdStringValRegex = /^"(.*)"\s+.*"(.*)"$/;

const cmdParamArrayRegex =
  /^((?:APPEND_)(ARRAY_PARAMETER))\s+(\S+)\s+.*(UINT|INT|FLOAT|DERIVED|STRING|BLOCK)(?:\s+"(.*)")?(?:\s+(BIG_ENDIAN|LITTLE_ENDIAN))?$/;

class ParserError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class CmdFileParser {
  private path: string;
  private parserState: CmdParserState;
  private commands: CmdDefinition[];
  private lineNumber: number;
  private outputChannel: vscode.OutputChannel;

  // Stash currently parsing command info in these private vars
  private currCmdDecl: CmdDeclaration | undefined;
  private currCmdParams: CmdParameter[] | undefined;

  public constructor(filePath: string, outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;

    this.parserState = CmdParserState.CMD_DECL;
    this.commands = [];
    this.path = filePath;

    this.currCmdDecl = undefined;
    this.lineNumber = 0;
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

  private searchParamDecl(line: string): CmdParameter | undefined {
    return undefined;
  }

  private storeBufferedCmdDef() {
    // TODO: Append the existing command declaration + parameters to the overall list of command definitions
  }

  private parseLine(line: string) {
    switch (this.parserState) {
      case CmdParserState.CMD_DECL:
        const cmdDecl = this.searchCmdDecl(line);
        if (cmdDecl === undefined) {
          break;
        }
        this.outputChannel.appendLine(`Found command declaration ${JSON.stringify(cmdDecl)}`);
        this.currCmdDecl = cmdDecl;
        this.parserState = CmdParserState.CMD_BODY_PARAM;
        break;
      case CmdParserState.CMD_BODY_PARAM:
        if (line.startsWith(COMMAND_KEYWD)) {
          this.storeBufferedCmdDef();
          this.parserState = CmdParserState.CMD_DECL;
          break;
        }
        const param = this.searchParamDecl(line);
        break;
      default:
        this.outputChannel.appendLine('default');
    }
  }

  private sanitizeLine(line: string): string {
    return line.trim();
  }

  public async parse(resources: CmdTlmResources) {
    const fileContent = fs.readFileSync(this.path, 'utf-8');

    const erbValues = new Map<string, string>();
    Object.assign(erbValues, resources.erb.variables);
    await resources.plugin.parse(resources.erb);
    Object.assign(erbValues, resources.plugin.variables);

    let erbResult = undefined;
    try {
      erbResult = await parseERB(fileContent, erbValues);
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
        this.parseLine(sanitized);
      } catch (err) {
        if (err instanceof ParserError) {
          return;
        }

        this.outputChannel.appendLine(`unexpected error occured ${err}`);
        throw err;
      }
    }

    this.storeBufferedCmdDef();
  }
}

interface CmdTlmResources {
  erb: CosmosERBConfig;
  plugin: CosmosPluginConfig;
  pluginDirectory: string;
  pluginName: string;
}

export class CosmosCmdTlmDB {
  private cmdMap: Map<string, CmdDefinition[]> = new Map();
  private tlmMap: Map<string, TlmDefinition[]> = new Map();
  private outputChannel: vscode.OutputChannel;

  public constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  public getCommands(target: string): CmdDefinition[] | undefined {
    return this.cmdMap.get(target.toUpperCase());
  }

  public getTlm(target: string): TlmDefinition[] | undefined {
    return this.tlmMap.get(target.toUpperCase());
  }

  public async compileWorkspace() {
    this.outputChannel.appendLine('Scanning workspace for cmd_tlm folders...');
    // Placeholder for file system scanning logic
  }

  private async getCmdTlmFileResources(filePath: string): Promise<CmdTlmResources> {
    this.outputChannel.appendLine(`Compiling resources for cmd/tlm def file ${filePath}`);

    const cSearch = new CosmosProjectSearch(this.outputChannel);
    const erbConfig = cSearch.getERBConfig(path.dirname(filePath)); /* Can fail gracefully */

    const [plugin, pluginPath] = cSearch.getPluginConfig(path.dirname(filePath));
    await plugin.parse(erbConfig); /* Can fail gracefully */

    return {
      erb: erbConfig,
      plugin: plugin,
      pluginDirectory: pluginPath,
      pluginName: path.basename(pluginPath),
    };
  }

  public async compileCmdFile(cmdFilePath: string) {
    const resources = await this.getCmdTlmFileResources(cmdFilePath);

    this.outputChannel.appendLine(`resources: ${JSON.stringify(resources)}`);

    const parser = new CmdFileParser(cmdFilePath, this.outputChannel);
    await parser.parse(resources);
  }
}
