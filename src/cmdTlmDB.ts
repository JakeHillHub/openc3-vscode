import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import erb from 'erb';

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

  public async parse() {
    this.outputChannel.appendLine('loading file');
    const fileContent = fs.readFileSync(this.path, 'utf-8');
    this.outputChannel.appendLine('new parse');

    try {
      this.outputChannel.appendLine(`cwd : ${process.cwd()}`);
      const result = await erb({
        template: fileContent,
        data: {
          values: {
            target_name: 'TEST',
            addr: '0x5555',
          },
        },
        timeout: 5000,
      });
      this.outputChannel.appendLine(`erb result: ${result}`);
    } catch (err) {
      this.outputChannel.appendLine(`erb error: ${err}`);
      throw err;
    }

    return;

    const lines = fileContent.split('\n');

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
    this.loadMockData();
  }

  private loadMockData() {
    this.cmdMap.set('TARGET1', [
      { id: 'CMD_ID1', description: 'Command One', arguments: ['ARG1', 'ARG2'] },
      { id: 'CMD_ID2', description: 'Command Two', arguments: ['ARG3'] },
    ]);
    this.tlmMap.set('TARGET1', [
      { id: 'PKT_ID1', description: 'Packet One', fields: ['FIELD1', 'FIELD2'] },
      { id: 'PKT_ID2', description: 'Packet Two', fields: ['FIELD3'] },
    ]);
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
    this.outputChannel.appendLine('here is a new log');
    this.outputChannel.appendLine(`Recompiling cmd/tlm def for file ${document.uri.fsPath}`);
    const parser = new CmdFileParser(document.uri.fsPath, this.outputChannel);
    await parser.parse();
  }
}
