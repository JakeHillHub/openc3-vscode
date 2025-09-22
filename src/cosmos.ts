import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import erb from 'erb';
import { start } from 'repl';
import { config } from 'process';

const COMMAND_KEYWD = 'COMMAND';

const PLUGIN_CONFIG_NAME = 'plugin.txt';
const ERB_CONFIG_NAME = 'openc3-erb.json';

interface CosmosErbConfig {
  path: string;
  values: Map<string, string>;
}

const pluginVarExpr = /^VARIABLE\s+(\S+)\s+(.*)$/;

export class CosmosPluginConfig {
  private outputChannel: vscode.OutputChannel;
  private path: string;

  public variables: Map<string, string>;

  constructor(pluginPath: string, outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.path = pluginPath;
    this.variables = new Map<string, string>();
  }

  private parsePluginVars() {
    const contents = fs.readFileSync(this.path, 'utf-8');
    const lines = contents.split('\n');
    for (let line of lines) {
      line = line.trim();

      /* VARIABLE lines only */
      const varMatch = line.match(pluginVarExpr);
      if (varMatch) {
        const [_, name, value] = varMatch;
        this.variables.set(name, value);
        continue;
      }
    }
  }

  public async parse(erbValues: Map<string, string>) {
    this.parsePluginVars();
    Object.assign(erbValues, this.variables);

    const contents = fs.readFileSync(this.path, 'utf-8');
    let erbResult = undefined;

    try {
      erbResult = await erb({
        template: contents,
        data: {
          values: this.variables,
        },
        timeout: 5000,
      });
    } catch (err) {
      this.outputChannel.appendLine(`erb error: ${err}`);
      this.outputChannel.show(true);
      throw err;
    }

    this.outputChannel.appendLine(`plugin erb result ${JSON.stringify(erbResult)}`);
  }
}

export class CosmosProjectSearch {
  private outputChannel: vscode.OutputChannel;

  public constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  private searchPath(startDir: string, fileName: string): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }

    const workspacePaths = workspaceFolders.map((wf) => path.normalize(wf.uri.fsPath));
    let currentDir = path.normalize(startDir);
    let previousDir: string | undefined = undefined;

    while (currentDir !== previousDir) {
      const configPath = path.join(currentDir, fileName);

      // Check if the config file exists
      if (fs.existsSync(configPath)) {
        return configPath;
      }

      // Check if we have hit a workspace folder
      if (workspacePaths.includes(currentDir)) {
        return undefined;
      }

      // Recurse up and check for the infinite loop condition
      previousDir = currentDir;
      currentDir = path.dirname(currentDir);
    }

    return undefined;
  }

  public getPluginConfig(startDir: string): CosmosPluginConfig | undefined {
    const configPath = this.searchPath(startDir, PLUGIN_CONFIG_NAME);
    if (!configPath) {
      return undefined;
    }

    const pluginConfig = new CosmosPluginConfig(configPath, this.outputChannel);
    return pluginConfig;
  }

  public getErbConfig(startDir: string): CosmosErbConfig | undefined {
    const configPath = this.searchPath(startDir, ERB_CONFIG_NAME);
    if (!configPath) {
      return undefined;
    }

    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    if (parsed === undefined) {
      return undefined;
    }

    return {
      path: configPath,
      values: parsed,
    };
  }
}

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

  private syntaxError(line: string): string {
    // Log to vscode console then return same message to throw
    const message = `Syntax error: '${line}'`;

    this.outputChannel.appendLine(`${this.path}:${this.lineNumber}:1: ${message}`);
    this.outputChannel.show(true);

    return message;
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

  public async parse(
    erbConfig: CosmosErbConfig | undefined,
    pluginConfig: CosmosPluginConfig | undefined
  ) {
    const fileContent = fs.readFileSync(this.path, 'utf-8');

    const erbValues = new Map<string, string>();
    if (erbConfig !== undefined) {
      /* Load initial erbConfig values for plugin.txt erb usage */
      Object.assign(erbValues, erbConfig.values);
    }

    if (pluginConfig !== undefined) {
      await pluginConfig.parse(erbValues);
      Object.assign(erbValues, pluginConfig.variables);
    }

    if (erbConfig !== undefined) {
      Object.assign(
        erbValues,
        erbConfig.values
      ); /* Re-write/overwrite anything from plugin.txt defined by openc3-erb.json instead */
    }

    let erbResult = undefined;
    try {
      erbResult = await erb({
        template: fileContent,
        data: {
          values: erbValues,
        },
        timeout: 5000,
      });
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

  public async compileFile(document: vscode.TextDocument) {
    this.outputChannel.appendLine(`Recompiling cmd/tlm def for file ${document.uri.fsPath}`);

    const cSearch = new CosmosProjectSearch(this.outputChannel);
    const erbConfig = cSearch.getErbConfig(path.dirname(document.uri.fsPath));

    const parser = new CmdFileParser(document.uri.fsPath, this.outputChannel);

    const pluginConfig = cSearch.getPluginConfig(path.dirname(document.uri.fsPath));
    await parser.parse(erbConfig, pluginConfig);
  }
}
