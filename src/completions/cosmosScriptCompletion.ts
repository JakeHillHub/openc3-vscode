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

  public groupIndex: number = -1;
  public argIndex: number = -1;

  public activeDefinition: ScriptCompletionDefinition | undefined = undefined;

  constructor(lineNumber: number) {
    this.lineNumber = lineNumber;
  }

  get hasDefinition(): boolean {
    return this.activeDefinition !== undefined;
  }

  public update(document: vscode.TextDocument, position: vscode.Position) {
    const linePrefix = document.getText(
      new vscode.Range(position.line, 0, position.line, position.character)
    );
    this.text = linePrefix.trim();
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

  private searchDefinition(text: string): ScriptCompletionDefinition | undefined {
    for (const definition of this.defs) {
      if (text.match(definition.match)) {
        return definition;
      }
    }
    return undefined;
  }

  private createNextCompletion(): vscode.ProviderResult<vscode.CompletionItem[]> {
    throw new NoCompletion('Nothing to complete');
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
