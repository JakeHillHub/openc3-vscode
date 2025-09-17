import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const COMMAND_KEYWD = 'COMMAND';

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
    description: string;
}

interface CmdParameter {
    name: string;
}

const cmdDeclarationRegex = /^COMMAND\s+(\S+)\s+(\S+)\s+(BIG_ENDIAN|LITTLE_ENDIAN)\s+"(.+)"$/;
const inlineIrbRegex = /<%.*?%>/g;

function sanitizeLine(line: string): string {
    // Trim excess whitespace and sanitize irb if present
    const trimmed = line.trim();
    return trimmed.replace(inlineIrbRegex, '');
}

class ParserError extends Error {
    constructor(public message: string) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

class CmdFileParser {
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

    private parseLine(line: string) {
        switch (this.parserState) {
            case CmdParserState.CMD_DECL:
                const cmdDecl = this.searchCmdDecl(line);
                if (cmdDecl === undefined) {
                    break;
                }
                this.outputChannel.appendLine(
                    `Found command declaration ${JSON.stringify(cmdDecl)}`
                );
                this.currCmdDecl = cmdDecl;
                this.parserState = CmdParserState.CMD_BODY_PARAM;
                break;
            case CmdParserState.CMD_BODY_PARAM:
                const
                break;
            default:
                console.log('default');
        }
    }

    public parse() {
        const fileContent = fs.readFileSync(this.path, 'utf-8');
        const lines = fileContent.split('\n');

        for (const line of lines) {
            this.lineNumber++;
            const sanitized = sanitizeLine(line);

            try {
                this.parseLine(sanitized);
            } catch (err) {
                if (err instanceof ParserError) {
                    return;
                }

                console.log(`unexpected error occured ${err}`);
                throw err;
            }
        }
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
        console.log('Scanning workspace for cmd_tlm folders...');
        // Placeholder for file system scanning logic
    }

    public async compileFile(document: vscode.TextDocument) {
        console.log(`Recompiling cmd/tlm def for file ${document.uri.fsPath}`);
        const parser = new CmdFileParser(document.uri.fsPath, this.outputChannel);
        parser.parse();
    }
}
