import * as vscode from 'vscode';
import { CmdArgument, CmdParamType, CosmosCmdTlmDB, TlmField } from '../cosmos/cmdTlm';
import { Script } from 'vm';

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

enum RefArgType {
  FIELD,
  MAPPING,
  CMD_PARAM,
}

interface RefArg {
  type: RefArgType;
  value: string | string[];
  param?: CmdArgument | TlmField;
}

function stripQuotes(str: string): string {
  return str.trim().replace(/['"]/g, '');
}

/**
 * Track completion info for the current line to shortcut logic on each completion
 */
class LineContext {
  private mapSeparator: string;

  public lineNumber: number;
  public text: string = '';

  public inlineRefQuoteInner: string = '';
  public method: CMethods | undefined = undefined;

  public groupIndex: number = 0;

  public activeDefinition: ScriptCompletionDefinition | undefined = undefined;

  constructor(lineNumber: number, language: Language) {
    this.lineNumber = lineNumber;

    if (language === Language.PYTHON) {
      this.mapSeparator = ':';
    } else if (language === Language.RUBY) {
      this.mapSeparator = '=>';
    } else {
      throw new Error('Invalid language type');
    }
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

  private getRefArgsInline(noFilter?: boolean): RefArg[] | undefined {
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
      this.inlineRefQuoteInner = "'";
    } else if (inlineArg.startsWith("'")) {
      this.inlineRefQuoteInner = '"';
    } else {
      return undefined; /* Unknown quote type */
    }

    const [_, inlineStr] = inlineStrMatch;
    let strArgs: string[] = inlineStr.split(' ');
    if (!noFilter) {
      strArgs = strArgs.filter((item) => item !== '');
    }

    const args: RefArg[] = [];
    let paramsFlagFound = false;
    let key = undefined;

    for (const arg of strArgs) {
      if (!paramsFlagFound) {
        if (arg === 'with') {
          paramsFlagFound = true;
        } else {
          args.push({ type: RefArgType.FIELD, value: arg });
        }
        continue;
      }
      if (key === undefined) {
        key = arg;
      } else {
        args.push({ type: RefArgType.MAPPING, value: [key, arg] });
        key = undefined;
      }
    }

    return args;
  }

  private parsePositionalArgs(argString: string): string[] {
    const strArgs: string[] = [];
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
        strArgs.push(currentArg.trim());
        currentArg = '';
      } else {
        currentArg += char;
      }
    }
    strArgs.push(currentArg.trim()); // Add the last argument

    return strArgs;
  }

  private getRefArgsPositional(): RefArg[] | undefined {
    const raw = this.getArgsRaw();
    if (raw === undefined) {
      return undefined;
    }

    const args: RefArg[] = [];
    const posArgsStr = this.parsePositionalArgs(raw);
    for (const posStr of posArgsStr) {
      /* Dictionary or Hash */
      if (posStr.match(/{.*?}/)) {
        const s = posStr.split(this.mapSeparator);
        if (s.length !== 2) {
          return undefined; /* Malformed dict or hash */
        }
        const key = stripQuotes(s[0].trim());
        const val = stripQuotes(s[1].trim());
        args.push({ type: RefArgType.MAPPING, value: [key, val] });
      } else {
        args.push({ type: RefArgType.FIELD, value: stripQuotes(posStr) });
      }
    }

    return args;
  }

  public retrieveRefArgs(method: CMethods): RefArg[] | undefined {
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

  public deriveCmdRefMethod(): CMethods | undefined {
    const inlineArgs = this.getRefArgsInline(true); /* No filter leaves empty strings in */
    if (inlineArgs !== undefined && inlineArgs.length > 1) {
      /* Starts like cmd("STRING<space>...") - 99% inline ref */
      this.method = CMethods.COMMAND_INLINE;
      return CMethods.COMMAND_INLINE;
    }

    const positionalArgs = this.getRefArgsPositional();
    if (positionalArgs !== undefined) {
      this.method = CMethods.COMMAND_POSITIONAL;
      return CMethods.COMMAND_POSITIONAL;
    }

    return undefined;
  }
}

export class CosmosScriptCompletionProvider implements vscode.CompletionItemProvider {
  private _subscriptions: vscode.Disposable[] = [];
  private _language: Language;

  private lineContext: LineContext;

  private outputChannel: vscode.OutputChannel;

  private defs: ScriptCompletionDefinition[];
  private db: CosmosCmdTlmDB;

  constructor(
    outputChannel: vscode.OutputChannel,
    definitions: ScriptCompletionDefinition[],
    language: Language,
    cmdTlmDB: CosmosCmdTlmDB
  ) {
    this.lineContext = new LineContext(-1, language);
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
              this.lineContext = new LineContext(currentLine, this.language);
            }
          }
        }
      )
    );
  }

  private createInlineStrCompletion(label: string, text: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Field);
    item.insertText = text;
    return item;
  }

  private generateTabstopArgs(values: string[]): string {
    const args: string[] = [];
    return `\${1|${values.join(',')}|}`;
  }

  private createInlineCmdParamCompletion(
    label: string,
    key: string,
    value: CmdArgument
  ): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    let tabStopper = this.generateTabstopArgs(value.defaultValue);
    if (value.enumValues.size !== 0) {
      const enumKeys: string[] = [];
      for (const [ename, _] of value.enumValues.entries()) {
        enumKeys.push(ename);
      }
      tabStopper = this.generateTabstopArgs(enumKeys);
    }

    const snippet = new vscode.SnippetString(`${key} ${tabStopper}`);

    item.insertText = snippet;
    return item;
  }

  private getRefsListForArg(refArg: ScriptCompletionArg, existingArgs: RefArg[]): RefArg[] {
    switch (refArg.source) {
      case ArgSource.CMD_TARGET: {
        return this.db.getCmdTargets().map((t) => {
          return { type: RefArgType.FIELD, value: t };
        });
      }
      case ArgSource.CMD_MNEMONIC: {
        const targetName = existingArgs[0];
        if (targetName === undefined || targetName.type !== RefArgType.FIELD) {
          throw new NoCompletion('No command target for mnemonic');
        }
        const targetCmds = this.db.getTargetCmds(targetName.value as string);

        const cmdMnemonics: string[] = [];
        for (const [cmdMnemonic, _] of targetCmds.entries()) {
          cmdMnemonics.push(cmdMnemonic);
        }
        return cmdMnemonics.map((m) => {
          return { type: RefArgType.FIELD, value: m };
        });
      }
      case ArgSource.CMD_PARAMS: {
        const targetName = existingArgs[0];
        if (targetName === undefined || targetName.type !== RefArgType.FIELD) {
          throw new NoCompletion('No command target for params');
        }
        const cmdMnemonic = existingArgs[1];
        if (cmdMnemonic === undefined || cmdMnemonic.type !== RefArgType.FIELD) {
          throw new NoCompletion('No command mnemonic for params');
        }
        const cmdParams = this.db.getTargetCmds(targetName.value as string);
        const cmdDefinition = cmdParams.get(cmdMnemonic.value as string);
        if (cmdDefinition === undefined) {
          throw new NoCompletion(`Could not find params for command mnemonic ${cmdMnemonic.value}`);
        }

        const existingParams = existingArgs.slice(2);
        const existingParamNames = existingParams.map((p) => {
          if (p.type === RefArgType.MAPPING) {
            return p.value[0];
          }
          return ''; /* Empty string will not match any parameter */
        });

        const args: RefArg[] = [];
        for (const param of cmdDefinition.arguments) {
          if (existingParamNames.includes(param.name)) {
            continue;
          }

          if (param.paramType === CmdParamType.ID_PARAMETER) {
            continue; /* Ignore ID parameters in suggestions */
          }

          args.push({
            type: RefArgType.CMD_PARAM,
            value: param.name,
            param: param,
          });
        }

        return args;
      }
      default:
        throw new NoCompletion('Invalid refArg');
    }
  }

  private cmdTlmCompletionInline(
    group: ScriptCompletionArgGroup,
    annotate: boolean
  ): vscode.CompletionItem[] {
    const existingArgs = this.lineContext.retrieveRefArgs(CMethods.COMMAND_INLINE);
    const argIndex = existingArgs?.length || 0; /* Default to zero if nothing could parse */
    const refArg = group.args[argIndex];
    if (refArg === undefined) {
      throw new NoCompletion('No args left in group');
    }

    const completions: vscode.CompletionItem[] = [];
    const refsList = this.getRefsListForArg(refArg, existingArgs || []);
    for (const ref of refsList) {
      const refVal = ref.value as string;
      let label = refVal;
      if (annotate) {
        label = label + ' inline';
      }

      if (ref.type === RefArgType.FIELD) {
        completions.push(this.createInlineStrCompletion(label, refVal));
      } else if (ref.type === RefArgType.CMD_PARAM) {
        completions.push(this.createInlineCmdParamCompletion(label, refVal, ref.param));
      }
    }

    throw new NoCompletion('Nothing to do');
  }

  private cmdTlmCompletionPositional(
    group: ScriptCompletionArgGroup,
    annotate: boolean
  ): vscode.CompletionItem[] {
    throw new NoCompletion('Not implemented');
  }

  private getCmdCompletion(
    method: CMethods,
    group: ScriptCompletionArgGroup,
    annotate: boolean
  ): vscode.CompletionItem[] {
    switch (method) {
      case CMethods.COMMAND_INLINE:
        return this.cmdTlmCompletionInline(group, annotate);
      case CMethods.COMMAND_POSITIONAL:
        return this.cmdTlmCompletionPositional(group, annotate);
      default:
        throw new NoCompletion('Impossible completion method');
    }
  }

  private cmdTlmCompletions(
    group: ScriptCompletionArgGroup
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    /* Try immediate solution first */
    const derivedMethod = this.lineContext.deriveCmdRefMethod();
    if (derivedMethod !== undefined) {
      return this.getCmdCompletion(derivedMethod, group, false);
    }

    /* If undecided return list of all available completions with method annotations */
    const completionItems: vscode.CompletionItem[] = [];
    let err: Error | undefined = undefined;

    for (const method of group.methods) {
      /* Aggregate all methods with annotations */
      try {
        completionItems.push(...this.getCmdCompletion(method, group, true));
      } catch (e) {
        if (e instanceof NoCompletion) {
          err = e;
          continue;
        }
        throw e;
      }
    }

    if (completionItems.length === 0 && err !== undefined) {
      throw err; /* Raise last exception if no completion could generate */
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
