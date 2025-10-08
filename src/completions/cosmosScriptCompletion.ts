import * as vscode from 'vscode';
import { CmdArgument, CmdParamType, CosmosCmdTlmDB, DataType, TlmField } from '../cosmos/cmdTlm';
import { Script } from 'vm';

enum GroupIndexes {
  REF_GROUP = 0 /* Special cosmos API sources */,
  FN_GROUP = 1 /* Regular function completion group */,
}

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

function stripQuoteComma(str: string): string {
  return str.trim().replace(/['",]/g, '');
}

/**
 * Track completion info for the current line to shortcut logic on each completion
 */
class LineContext {
  private mapSeparator: string;

  public lineNumber: number;
  public text: string = '';

  public inlineRefQuoteInner: string = '';
  public inlineRefQuoteOuter: string = '';

  public method: CMethods | undefined = undefined;
  public methodLocked: boolean = false;

  public groupIndex: number = GroupIndexes.REF_GROUP; /* Always start at REF_GROUP */

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

  private splitInlineArgs(inlineStr: string): string[] {
    // Handle case where string parameters enclosed in single/double quotes contain a space
    // Cannot simply split(' ')
    const tokenRegex = /(".*?"|'.*?'|[^ ]+)/g;
    const tokens = inlineStr.match(tokenRegex);

    if (!tokens) {
      return [];
    }

    return tokens.map((token) => token.trim()).filter((token) => token.length > 0);
  }

  private getRefArgsInline(): RefArg[] | undefined {
    const raw = this.getArgsRaw();
    if (raw === undefined) {
      return undefined;
    }

    /* Derive innerQuoteValue for parameters */
    let inlineStrMatch = null;
    if (raw.startsWith('"')) {
      this.inlineRefQuoteInner = "'";
      this.inlineRefQuoteOuter = '"';
      inlineStrMatch = raw.trim().match(/^"(.*?)"/); /* Capture between doubles */
    } else if (raw.startsWith("'")) {
      this.inlineRefQuoteInner = '"';
      this.inlineRefQuoteOuter = "'";
      inlineStrMatch = raw.trim().match(/^'(.*?)'/); /* Capture between singles */
    } else {
      return undefined; /* Unknown quote type */
    }
    if (!inlineStrMatch) {
      return undefined;
    }

    const inlineArg = inlineStrMatch[1];
    if (inlineArg === undefined) {
      return undefined;
    }

    const [_, inlineStr] = inlineStrMatch;
    let strArgs: string[] = this.splitInlineArgs(inlineStr);

    const args: RefArg[] = [];
    let paramsFlagFound = false;
    let key = undefined;

    for (const arg of strArgs) {
      if (!paramsFlagFound) {
        if (arg === 'with') {
          paramsFlagFound = true;
        } else {
          args.push({ type: RefArgType.FIELD, value: stripQuotes(arg) });
        }
        continue;
      }
      if (key === undefined) {
        key = arg;
      } else {
        args.push({ type: RefArgType.MAPPING, value: [stripQuotes(key), stripQuoteComma(arg)] });
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

  private detectPositional(): boolean | undefined {
    const raw = this.getArgsRaw();
    if (raw === undefined) {
      return undefined;
    }

    let result = null;
    if (raw.startsWith('"')) {
      result = raw.trim().match(/^".*?",/); /* Capture between doubles */
    } else if (raw.startsWith("'")) {
      result = raw.trim().match(/^'.*?',/); /* Capture between singles */
    }

    if (result === null) {
      return false;
    }
    return true;
  }

  private getRefArgsPositional(): RefArg[] | undefined {
    const raw = this.getArgsRaw();
    if (raw === undefined) {
      return undefined;
    }

    const args: RefArg[] = [];
    const posArgsStr = this.parsePositionalArgs(raw);
    for (const posStr of posArgsStr) {
      if (posStr === '') {
        continue;
      }

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
        args.push({ type: RefArgType.FIELD, value: stripQuoteComma(posStr) });
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
    if (this.methodLocked) {
      return this.method;
    }

    if (this.detectPositional()) {
      const positionalArgs = this.getRefArgsPositional();
      if (positionalArgs !== undefined && positionalArgs.length !== 0) {
        this.method = CMethods.COMMAND_POSITIONAL;
        return CMethods.COMMAND_POSITIONAL;
      }
    }

    const inlineArgs = this.getRefArgsInline(); /* No filter leaves empty strings in */
    if (inlineArgs !== undefined && inlineArgs.length >= 1) {
      /* Starts like cmd("STRING<space>...") - 99% inline ref */
      this.method = CMethods.COMMAND_INLINE;
      return CMethods.COMMAND_INLINE;
    }

    return undefined;
  }

  private detectGroupInline() {
    const raw = this.getArgsRaw();
    if (raw === undefined) {
      return;
    }

    /* Match cmd("...", ) <- for inline syntax this is now outside the ref group (group 0) */
    const pattern = new RegExp(`${this.inlineRefQuoteOuter},\\s+$`);
    const result = raw.match(pattern);
    if (result) {
      this.groupIndex = GroupIndexes.FN_GROUP;
    } else {
      this.groupIndex = GroupIndexes.REF_GROUP;
    }
  }

  private detectGroupPositional() {
    const raw = this.getArgsRaw();
    if (raw === undefined) {
      return;
    }
    if (this.activeDefinition === undefined || this.activeDefinition.groups.length === 1) {
      return; /* No alternate group */
    }

    const preParsed = this.parsePositionalArgs(raw);
    const refGroupLength = this.activeDefinition.groups[GroupIndexes.REF_GROUP].args.length;

    if (preParsed.length > refGroupLength) {
      this.groupIndex = GroupIndexes.FN_GROUP;
    } else {
      this.groupIndex = GroupIndexes.REF_GROUP;
    }
  }

  public detectGroup() {
    if (!this.methodLocked) {
      return;
    }
    if (this.activeDefinition?.groups.length === 1) {
      return; /* No alternate group */
    }

    switch (this.method) {
      case CMethods.COMMAND_INLINE:
        this.detectGroupInline();
        break;
      case CMethods.COMMAND_POSITIONAL:
        this.detectGroupPositional();
        break;
    }
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

  private createInlineStrCompletionNewQuote(label: string, text: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    const snippet = `"${text}$0"`;
    item.insertText = new vscode.SnippetString(snippet);
    return item;
  }

  private generateTabstopArgs(values: string[], quoteValues?: boolean): string {
    const joinedValues = values.join(',');
    const coreTabstop = `\${1|${joinedValues}|}`;
    const finalExit = '$0';

    if (quoteValues) {
      const quote = this.lineContext.inlineRefQuoteInner;
      return `${quote}${coreTabstop}${quote}${finalExit}`;
    }

    return `${coreTabstop}${finalExit}`;
  }

  private createInlineCmdParamCompletion(
    label: string,
    key: string,
    value: CmdArgument,
    firstParam: boolean
  ): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    let tabStopper = this.generateTabstopArgs(
      [value.defaultValue],
      value.dataType === DataType.STRING
    );
    if (value.enumValues.size !== 0) {
      const enumKeys: string[] = [];
      for (const [ename, _] of value.enumValues.entries()) {
        enumKeys.push(ename);
      }
      tabStopper = this.generateTabstopArgs(enumKeys, true);
    }

    let snippetText = `${key} ${tabStopper}`;
    if (firstParam) {
      snippetText = 'with ' + snippetText;
    }
    const snippet = new vscode.SnippetString(snippetText);

    item.insertText = snippet;
    return item;
  }

  private getRefsCmdTarget(): RefArg[] {
    return this.db.getCmdTargets().map((t) => {
      return { type: RefArgType.FIELD, value: t };
    });
  }

  private getRefsCmdMnemonic(existingArgs: RefArg[]): RefArg[] {
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

  private getRefsCmdParams(existingArgs: RefArg[]): RefArg[] {
    const targetName = existingArgs[0];
    if (targetName === undefined || targetName.type !== RefArgType.FIELD) {
      throw new NoCompletion('No command target for params');
    }
    const cmdMnemonic = existingArgs[1];
    if (cmdMnemonic === undefined || cmdMnemonic.type !== RefArgType.FIELD) {
      throw new NoCompletion('No command mnemonic for params');
    }
    const cmds = this.db.getTargetCmds(targetName.value as string);
    const cmdDefinition = cmds.get(cmdMnemonic.value as string);
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

  private getRefsOptions(refArg: ScriptCompletionArg): RefArg[] {
    if (refArg?.options === undefined) {
      throw new NoCompletion('No options defined for options source');
    }

    const args: RefArg[] = [];
    for (const opt of refArg.options) {
      args.push({
        type: RefArgType.FIELD,
        value: opt,
      });
    }
    return args;
  }

  private getRefsListForArg(refArg: ScriptCompletionArg, existingArgs: RefArg[]): RefArg[] {
    switch (refArg.source) {
      case ArgSource.CMD_TARGET:
        return this.getRefsCmdTarget();
      case ArgSource.CMD_MNEMONIC:
        return this.getRefsCmdMnemonic(existingArgs);
      case ArgSource.CMD_PARAMS:
        return this.getRefsCmdParams(existingArgs);
      case ArgSource.OPTIONS:
        return this.getRefsOptions(refArg);
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

    if (argIndex >= 1) {
      /* cmd("ARG1 <here>...", ...)
      /* We can be confident that this completion method is definitely inline now */
      this.lineContext.methodLocked = true;
    }

    let refArg = group.args[argIndex];
    if (refArg === undefined) {
      const lastArg = group.args.at(-1);
      /* If this is variable length parameters we can proceed always */
      if (lastArg === undefined || lastArg.source !== ArgSource.CMD_PARAMS) {
        /* If it was not variable length parameters we are done with completions */
        throw new NoCompletion('No more args to complete');
      }
      refArg = lastArg;
    }

    const completions: vscode.CompletionItem[] = [];
    const refsList = this.getRefsListForArg(refArg, existingArgs || []);
    for (const ref of refsList) {
      let refVal = ref.value as string;
      let label = refVal;
      if (annotate) {
        label = label + ' (inline)';
      }

      if (ref.type === RefArgType.FIELD) {
        if (argIndex === 0) {
          /* First overall parameter, wrap in quotes */
          completions.push(this.createInlineStrCompletionNewQuote(label, refVal));
        } else {
          completions.push(this.createInlineStrCompletion(label, refVal));
        }
      } else if (ref.type === RefArgType.CMD_PARAM) {
        const firstParam = argIndex === 2;
        completions.push(
          this.createInlineCmdParamCompletion(label, refVal, ref.param as CmdArgument, firstParam)
        );
      }
    }

    return completions;
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
        this.outputChannel.append(`Unexpected error handling script completion generation ${e}`);
        return undefined;
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
    this.lineContext.detectGroup();

    if (this.lineContext.groupIndex === GroupIndexes.REF_GROUP) {
      this.outputChannel.appendLine(`Group REF`);
    } else {
      this.outputChannel.appendLine(`Group FN`);
    }

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
