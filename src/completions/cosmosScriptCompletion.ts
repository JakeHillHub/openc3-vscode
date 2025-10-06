import * as vscode from 'vscode';
import { CosmosCmdTlmDB } from '../cosmos/cmdTlm';

export enum Language {
  RUBY = 'ruby',
  PYTHON = 'python',
}

export enum CMethods {
  COMMAND_INLINE /* Inline syntax using "with" in a single string */,
  COMMAND_POSITIONAL /* Normal language syntax argument */,
  COMMAND_OPTIONAL_KWD /* Optional Keyword/Hash Parameter */,
  TELEMETRY_INLINE /* Inline syntax in a single string */,
  TELEMETRY_POSITIONAL /* Normal language syntax with seperate args */,
  TELEMETRY_OPTIONAL_KWD /* Optional Keyword/Hash Parameter */,
}

export enum ArgSource {
  CMD_TARGET,
  CMD_MNEMONIC,
  CMD_PARAMS,
  TLM_TARGET,
  TLM_MNEMONIC,
  TLM_FIELD,
  OPTIONS,
  NONE,
}

export enum GroupType {
  CMD_TLM_REF,
  API_FN_ARGS,
}

export interface ScriptCompletionArg {
  title: string;
  source: ArgSource;
  options?: string[] | undefined;
}

export interface ScriptCompletionArgGroup {
  args: ScriptCompletionArg[];
  type: GroupType;
  methods: CMethods[];
}

export interface ScriptCompletionDefinition {
  triggers: string[];
  match: RegExp;
  groups: ScriptCompletionArgGroup[];
}

class NoCompletion extends Error {
  constructor(public message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Track completion info for the current line to shortcut logic on each completion
 */
class LineContext {
  public lineNumber: number;
  public text: string = '';
  public refQuoteInner: string = '';

  public groupIndex: number = 0;
  public argIndex: number = 0;

  public activeDefinition: ScriptCompletionDefinition | undefined = undefined;

  constructor(lineNumber: number) {
    this.lineNumber = lineNumber;
  }

  get hasDefinition(): boolean {
    return this.activeDefinition !== undefined;
  }

  public update(document: vscode.TextDocument, position: vscode.Position) {
    const line = document.lineAt(position).text;
    this.text = line.trim();
  }

  /**
   * Get everything as a raw string between () using match condition in completion def
   */
  private getArgsRaw(): string | undefined {
    const regMatch = this.activeDefinition?.match;
    if (!regMatch) {
      return undefined;
    }
    const result = this.text.match(regMatch);
    if (!result) {
      return undefined;
    }

    const [_, raw] = result;
    return raw;
  }

  private getRefArgsInline(): string[] | undefined {
    const raw = this.getArgsRaw();
    if (raw === undefined) {
      return undefined;
    }

    const inlineArg = raw.trim().split(',')[0];
    const inlineStrMatch = inlineArg.match(/^['"](.*?)['"]$/);
    if (!inlineStrMatch) {
      return undefined;
    }

    /* Derive innerQuoteValue for parameters */
    if (inlineArg.startsWith('"')) {
      this.refQuoteInner = "'";
    } else if (inlineArg.startsWith("'")) {
      this.refQuoteInner = '"';
    } else {
      return undefined; /* Unknown quote type */
    }

    const [_, inlineStr] = inlineStrMatch;
    const args: string[] = inlineStr.split(' ').filter((item) => item !== '');
    return args;
  }

  private parsePositionalArgs(argString: string): string[] {
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

  private getRefArgsPositional(): string[] | undefined {
    const raw = this.getArgsRaw();
    if (raw === undefined) {
      return undefined;
    }
    return this.parsePositionalArgs(raw);
  }

  public retrieveCmdTlmRefArgs(method: CMethods): string[] | undefined {
    switch (method) {
      case CMethods.TELEMETRY_INLINE:
      case CMethods.COMMAND_INLINE:
        return this.getRefArgsInline();
      case CMethods.TELEMETRY_POSITIONAL:
      case CMethods.COMMAND_POSITIONAL:
        return this.getRefArgsPositional();
      default:
        return undefined;
    }
  }
}

export class CosmosScriptCompletionProvider implements vscode.CompletionItemProvider {
  private _subscriptions: vscode.Disposable[] = [];
  private _language: Language;

  private lineContext: LineContext = new LineContext(-1);

  private outputChannel: vscode.OutputChannel;

  private defs: ScriptCompletionDefinition[];
  private db: CosmosCmdTlmDB;

  constructor(
    outputChannel: vscode.OutputChannel,
    definitions: ScriptCompletionDefinition[],
    language: Language,
    cmdTlmDB: CosmosCmdTlmDB
  ) {
    this.outputChannel = outputChannel;
    this.outputChannel.show(true);

    this._language = language;

    this.defs = definitions;
    this.db = cmdTlmDB;

    this.createCursorListener();
  }

  get language(): Language {
    return this._language;
  }

  get triggerChars(): string[] {
    const triggerSet = new Set<string>();
    for (const definition of this.defs) {
      for (const trigger of definition.triggers) {
        triggerSet.add(trigger);
      }
    }

    triggerSet.add(' '); /* Always trigger on space char */
    triggerSet.add(','); /* Always trigger on comma char */
    triggerSet.add('('); /* Always trigger on left paren char */

    return [...triggerSet];
  }

  get additionalSubscriptions(): vscode.Disposable[] {
    return this._subscriptions;
  }

  private createCursorListener() {
    this._subscriptions.push(
      vscode.window.onDidChangeTextEditorSelection(
        (event: vscode.TextEditorSelectionChangeEvent) => {
          if (event.textEditor === vscode.window.activeTextEditor) {
            const currentPosition = event.selections[0].active;
            const currentLine = currentPosition.line;

            if (this.lineContext.lineNumber !== currentLine) {
              this.lineContext = new LineContext(currentLine);
            }
          }
        }
      )
    );
  }

  private getCmdTlmRefs(arg: ScriptCompletionArg): string[] | undefined {
    return undefined;
  }

  private cmdTlmCompletionInline(
    group: ScriptCompletionArgGroup
  ): vscode.CompletionItem[] | undefined {
    const existingArgs = this.lineContext.retrieveCmdTlmRefArgs(CMethods.COMMAND_INLINE);
    if (existingArgs === undefined) {

    }

    return undefined;
  }

  private cmdTlmCompletions(
    group: ScriptCompletionArgGroup
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const completionItems: vscode.CompletionItem[] = [];
    for (const method of group.methods) {
      let items: vscode.CompletionItem[] | undefined = undefined;
      switch (method) {
        case CMethods.COMMAND_INLINE:
          items = this.cmdTlmCompletionInline(group);
          break;
        case CMethods.COMMAND_POSITIONAL:
          break;
      }
      if (items !== undefined) {
        completionItems.push(...items);
      }
    }
    return completionItems;
  }

  private apiFnCompletions(
    group: ScriptCompletionArgGroup
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const completionItems: vscode.CompletionItem[] = [];
    return completionItems;
  }

  private createNextCompletion(): vscode.ProviderResult<vscode.CompletionItem[]> {
    const group = this.lineContext.activeDefinition?.groups[this.lineContext.groupIndex];
    if (!group) {
      return undefined;
    }

    switch (group.type) {
      case GroupType.CMD_TLM_REF:
        return this.cmdTlmCompletions(group);
      case GroupType.API_FN_ARGS:
        return this.apiFnCompletions(group);
      default:
        return undefined;
    }
  }

  private searchDefinition(text: string): ScriptCompletionDefinition | undefined {
    for (const definition of this.defs) {
      if (text.match(definition.match)) {
        return definition;
      }
    }
    return undefined;
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    this.lineContext.update(document, position);

    if (!this.lineContext.hasDefinition) {
      this.lineContext.activeDefinition = this.searchDefinition(this.lineContext.text);
      if (!this.lineContext.hasDefinition) {
        return undefined; /* No definition found - nothing initialized - nothing to do */
      }
    }

    try {
      return this.createNextCompletion();
    } catch (err) {
      if (err instanceof NoCompletion) {
        return undefined;
      }

      this.outputChannel.appendLine(`exception during completion processing: ${err}`);
    }
  }
}
