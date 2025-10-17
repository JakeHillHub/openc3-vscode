import * as vscode from 'vscode';
import { CmdArgument, CmdParamType, CosmosCmdTlmDB, DataType, TlmField } from '../cosmos/cmdTlm';

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
  CMD_PARAM_NAME,
  TLM_TARGET,
  TLM_MNEMONIC,
  TLM_FIELD,
  TLM_FIELD_COMPARISON,
  OPTIONS,
  NONE,
}

export enum GroupType {
  CMD_REF,
  TLM_REF,
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
  match: RegExp;
  group: ScriptCompletionArgGroup;
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
  TLM_COMP,
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
  private language: Language;

  public lineNumber: number;
  public text: string = '';

  public inlineRefQuoteInner: string = '';

  public groupIndex: number = GroupIndexes.REF_GROUP; /* Always start at REF_GROUP */

  public activeDefinition: ScriptCompletionDefinition | undefined = undefined;

  constructor(lineNumber: number, language: Language) {
    this.lineNumber = lineNumber;
    this.language = language;

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

  public keyValMapStr(key: string, value: string): string {
    if (this.language === Language.PYTHON) {
      return `${key}: ${value}`;
    } else if (this.language === Language.RUBY) {
      return `${key} => ${value}`;
    } else {
      throw new Error('Invalid language type');
    }
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

    return tokens.map((token) => token.trim()).filter((token) => token.length > 0 && token !== ',');
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
      inlineStrMatch = raw.trim().match(/^"(.*?)"/); /* Capture between doubles */
    } else if (raw.startsWith("'")) {
      this.inlineRefQuoteInner = '"';
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
      const mapMatch = posStr.match(/{(.*?)}/);
      if (!mapMatch) {
        args.push({ type: RefArgType.FIELD, value: stripQuoteComma(posStr) });
      } else {
        const [, contents] = mapMatch;
        const keyValPairs = contents
          .split(',')
          .map((val) => val.trim())
          .filter((val) => val.length > 0);

        for (const keyVal of keyValPairs) {
          const s = keyVal.split(this.mapSeparator);
          if (s.length !== 2) {
            return undefined; /* Malformed dict or hash */
          }
          const key = stripQuotes(s[0].trim());
          const val = stripQuotes(s[1].trim());
          args.push({ type: RefArgType.MAPPING, value: [key, val] });
        }
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
    if (this.detectPositional()) {
      const positionalArgs = this.getRefArgsPositional();
      if (positionalArgs !== undefined && positionalArgs.length !== 0) {
        return CMethods.COMMAND_POSITIONAL;
      }
    }

    const inlineArgs = this.getRefArgsInline(); /* No filter leaves empty strings in */
    if (inlineArgs !== undefined && inlineArgs.length >= 1) {
      return CMethods.COMMAND_INLINE;
    }

    return undefined;
  }

  public deriveTlmRefMethod(): CMethods | undefined {
    if (this.detectPositional()) {
      const positionalArgs = this.getRefArgsPositional();
      if (positionalArgs !== undefined && positionalArgs.length !== 0) {
        return CMethods.TELEMETRY_POSITIONAL;
      }
    }

    const inlineArgs = this.getRefArgsInline();
    if (inlineArgs !== undefined && inlineArgs.length >= 1) {
      return CMethods.TELEMETRY_INLINE;
    }
  }
}

export class CosmosScriptCompletionProvider implements vscode.CompletionItemProvider {
  private _subscriptions: vscode.Disposable[] = [];
  private _language: Language;

  private document: vscode.TextDocument | undefined;
  private position: vscode.Position | undefined;

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

    this._language = language;

    this.defs = definitions;
    this.db = cmdTlmDB;

    this.createCursorListener();
    this.createDeleteListener();
  }

  get language(): Language {
    return this._language;
  }

  get triggerChars(): string[] {
    /* Trigger on space, open paren, tab, comma, backspace */
    return [' ', '(', '\t', ',', '\b'];
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

  private createDeleteListener() {
    this._subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        for (const change of event.contentChanges) {
          if (change.rangeLength > 0 && change.text === '') {
            const currentPosition = change.range.start;
            const currentLine = currentPosition.line;
            const derivedDefinition = this.searchDefinition(this.lineContext.text);
            if (
              this.lineContext.hasDefinition &&
              this.lineContext.activeDefinition !== derivedDefinition
            ) {
              this.lineContext = new LineContext(currentLine, this.language);
              this.outputChannel.appendLine('reset line context buffer');
              this.outputChannel.show(true);
            }
          }
        }
      })
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

  private generateTabstopArgs(values: string[], quoteValues: boolean, quoteChar: string): string {
    let joinedValues = values.join(',');
    if (joinedValues === '') {
      joinedValues = ' ';
    }

    let coreTabstop;
    if (values.length > 1) {
      coreTabstop = `\${1|${joinedValues}|}`;
    } else {
      coreTabstop = `\${1:${joinedValues}}`;
    }

    if (quoteValues) {
      return `${quoteChar}${coreTabstop}${quoteChar}$0`;
    }

    return `${coreTabstop}$0`;
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
      value.dataType === DataType.STRING,
      this.lineContext.inlineRefQuoteInner
    );
    if (value.enumValues.size !== 0) {
      const enumKeys: string[] = [];
      for (const [ename, _] of value.enumValues.entries()) {
        enumKeys.push(ename);
      }
      tabStopper = this.generateTabstopArgs(enumKeys, true, this.lineContext.inlineRefQuoteInner);
    }

    let snippetText = `${key} ${tabStopper}`;
    if (firstParam) {
      snippetText = 'with ' + snippetText;
    }
    const snippet = new vscode.SnippetString(snippetText);

    item.insertText = snippet;
    return item;
  }

  private createInlineTlmCompCompletion(
    label: string,
    key: string,
    value: TlmField
  ): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    let tabStopper = this.generateTabstopArgs(
      [this.db.deriveTlmFieldDefault(value)],
      value.dataType === DataType.STRING,
      '"'
    );
    if (value.enumValues.size !== 0) {
      const enumKeys: string[] = [];
      for (const [ename, _] of value.enumValues.entries()) {
        enumKeys.push(ename);
      }
      tabStopper = this.generateTabstopArgs(enumKeys, true, '"');
    }

    let snippetText = `${key} ${tabStopper}`;
    const snippet = new vscode.SnippetString(snippetText);
    item.insertText = snippet;
    return item;
  }

  private createPositionalCompletion(label: string, text: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Field);
    item.insertText = `"${text}"`;
    return item;
  }

  private createPositionalCmdParamCompletion(
    label: string,
    key: string,
    value: CmdArgument,
    firstParam: boolean
  ): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    let tabStopper = this.generateTabstopArgs(
      [value.defaultValue],
      value.dataType === DataType.STRING,
      '"'
    );

    if (value.enumValues.size !== 0) {
      const enumKeys: string[] = [];
      for (const [ename, _] of value.enumValues.entries()) {
        enumKeys.push(ename);
      }
      tabStopper = this.generateTabstopArgs(enumKeys, true, '"');
    }

    let snippetText = this.lineContext.keyValMapStr(`"${key}"`, tabStopper);
    if (firstParam) {
      snippetText = `{${snippetText}}`;
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

  private getRefsTlmTarget(): RefArg[] {
    return this.db.getTlmTargets().map((t) => {
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

  private getRefsTlmMnemonic(existingArgs: RefArg[]): RefArg[] {
    const targetName = existingArgs[0];
    if (targetName === undefined || targetName.type !== RefArgType.FIELD) {
      throw new NoCompletion('No telemetry target for mnemonic');
    }
    const targetPackets = this.db.getTargetPackets(targetName.value as string);

    const packetMnemonics: string[] = [];
    for (const [packetMnemonic, _] of targetPackets.entries()) {
      packetMnemonics.push(packetMnemonic);
    }
    return packetMnemonics.map((m) => {
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

  private getRefsCmdParamName(existingArgs: RefArg[]): RefArg[] {
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

    const args: RefArg[] = [];
    for (const param of cmdDefinition.arguments) {
      if (param.paramType === CmdParamType.ID_PARAMETER) {
        continue; /* Ignore ID parameters in suggestions */
      }

      args.push({
        type: RefArgType.FIELD,
        value: param.name,
      });
    }

    return args;
  }

  private getRefsTlmField(existingArgs: RefArg[]): RefArg[] {
    const targetName = existingArgs[0];
    if (targetName === undefined || targetName.type !== RefArgType.FIELD) {
      throw new NoCompletion('No telemetry target for params');
    }
    const tlmMnemonic = existingArgs[1];
    if (tlmMnemonic === undefined || tlmMnemonic.type !== RefArgType.FIELD) {
      throw new NoCompletion('No packet mnemonic for params');
    }

    const packet = this.db.getTargetPacket(targetName.value as string, tlmMnemonic.value as string);
    if (packet === undefined) {
      throw new NoCompletion(`Could not find params for packet mnemonic ${tlmMnemonic.value}`);
    }

    const args: RefArg[] = [];
    for (const field of packet.fields) {
      args.push({
        type: RefArgType.FIELD,
        value: field.name,
      });
    }
    return args;
  }

  private getRefsTlmFieldComparison(
    refArg: ScriptCompletionArg | undefined,
    existingArgs: RefArg[]
  ): RefArg[] {
    const targetName = existingArgs[0];
    if (targetName === undefined || targetName.type !== RefArgType.FIELD) {
      throw new NoCompletion('No telemetry target for params');
    }
    const tlmMnemonic = existingArgs[1];
    if (tlmMnemonic === undefined || tlmMnemonic.type !== RefArgType.FIELD) {
      throw new NoCompletion('No packet mnemonic for params');
    }
    const tlmField = existingArgs[2];
    if (tlmField === undefined || tlmField.type !== RefArgType.FIELD) {
      throw new NoCompletion('No packet field for params');
    }

    if (refArg?.options === undefined) {
      throw new NoCompletion('No options defined for options source');
    }

    const field = this.db.getTargetPacketField(
      targetName.value as string,
      tlmMnemonic.value as string,
      tlmField.value as string
    );
    if (field === undefined) {
      throw new NoCompletion(
        `Could not find field ${tlmField.value} for packet mnemonic ${tlmMnemonic.value}`
      );
    }

    const args: RefArg[] = [];
    for (const opt of refArg.options) {
      args.push({
        type: RefArgType.TLM_COMP,
        value: opt,
        param: field,
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
      case ArgSource.CMD_PARAM_NAME:
        return this.getRefsCmdParamName(existingArgs);
      case ArgSource.TLM_TARGET:
        return this.getRefsTlmTarget();
      case ArgSource.TLM_MNEMONIC:
        return this.getRefsTlmMnemonic(existingArgs);
      case ArgSource.TLM_FIELD:
        return this.getRefsTlmField(existingArgs);
      case ArgSource.TLM_FIELD_COMPARISON:
        return this.getRefsTlmFieldComparison(refArg, existingArgs);
      case ArgSource.OPTIONS:
        return this.getRefsOptions(refArg);
      default:
        throw new NoCompletion('Invalid refArg');
    }
  }

  private cmdCompletionInline(
    group: ScriptCompletionArgGroup,
    annotate: boolean
  ): vscode.CompletionItem[] {
    const existingArgs = this.lineContext.retrieveRefArgs(CMethods.COMMAND_INLINE);
    const argIndex = existingArgs?.length || 0; /* Default to zero if nothing could parse */

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

  private tlmCompletionInline(group: ScriptCompletionArgGroup, annotate: boolean) {
    const existingArgs = this.lineContext.retrieveRefArgs(CMethods.TELEMETRY_INLINE);
    const argIndex = existingArgs?.length || 0; /* Default to zero if nothing could parse */

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
      } else if (ref.type === RefArgType.TLM_COMP) {
        completions.push(this.createInlineTlmCompCompletion(label, refVal, ref.param as TlmField));
      }
    }

    return completions;
  }

  private cmdCompletionPositional(
    group: ScriptCompletionArgGroup,
    annotate: boolean
  ): vscode.CompletionItem[] {
    const existingArgs = this.lineContext.retrieveRefArgs(CMethods.COMMAND_POSITIONAL);
    const argIndex = existingArgs?.length || 0; /* Default to zero if nothing could parse */

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
        label = label + ' (positional)';
      }

      if (ref.type === RefArgType.FIELD) {
        completions.push(this.createPositionalCompletion(label, refVal));
      } else if (ref.type === RefArgType.CMD_PARAM) {
        const firstParam = argIndex === 2;
        completions.push(
          this.createPositionalCmdParamCompletion(
            label,
            refVal,
            ref.param as CmdArgument,
            firstParam
          )
        );
      }
    }

    return completions;
  }

  private tlmCompletionPositional(group: ScriptCompletionArgGroup, annotate: boolean) {
    const existingArgs = this.lineContext.retrieveRefArgs(CMethods.TELEMETRY_POSITIONAL);
    const argIndex = existingArgs?.length || 0; /* Default to zero if nothing could parse */

    let refArg = group.args[argIndex];
    if (refArg === undefined) {
      /* Simpler than cmd, no variadic parameter lengths to deal with */
      throw new NoCompletion('No more args to complete');
    }

    const completions: vscode.CompletionItem[] = [];
    const refsList = this.getRefsListForArg(refArg, existingArgs || []);
    for (const ref of refsList) {
      let refVal = ref.value as string;
      let label = refVal;
      if (annotate) {
        label = label + ' (positional)';
      }

      completions.push(this.createPositionalCompletion(label, refVal));
    }

    return completions;
  }

  private generateCmdTlmCompletion(
    method: CMethods,
    group: ScriptCompletionArgGroup,
    annotate: boolean
  ): vscode.CompletionItem[] {
    switch (method) {
      case CMethods.COMMAND_INLINE:
        return this.cmdCompletionInline(group, annotate);
      case CMethods.COMMAND_POSITIONAL:
        return this.cmdCompletionPositional(group, annotate);
      case CMethods.TELEMETRY_INLINE:
        return this.tlmCompletionInline(group, annotate);
      case CMethods.TELEMETRY_POSITIONAL:
        return this.tlmCompletionPositional(group, annotate);
      default:
        throw new NoCompletion('Impossible completion method');
    }
  }

  private cmdTlmCompletions(
    refType: GroupType,
    group: ScriptCompletionArgGroup
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    /* Try immediate solution first */
    let derivedMethod = undefined;
    if (refType === GroupType.CMD_REF) {
      derivedMethod = this.lineContext.deriveCmdRefMethod();
    } else if (refType === GroupType.TLM_REF) {
      derivedMethod = this.lineContext.deriveTlmRefMethod();
    }
    if (derivedMethod !== undefined) {
      return this.generateCmdTlmCompletion(derivedMethod, group, false);
    }

    /* If undecided return list of all available completions with method annotations */
    const completionItems: vscode.CompletionItem[] = [];
    let err: Error | undefined = undefined;

    for (const method of group.methods) {
      /* Aggregate all methods with annotations */
      try {
        completionItems.push(...this.generateCmdTlmCompletion(method, group, true));
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

  private createNextCompletion(): vscode.ProviderResult<vscode.CompletionItem[]> {
    const group = this.lineContext.activeDefinition?.group;
    if (!group) {
      return undefined;
    }

    switch (group.type) {
      case GroupType.CMD_REF:
        return this.cmdTlmCompletions(GroupType.CMD_REF, group);
      case GroupType.TLM_REF:
        return this.cmdTlmCompletions(GroupType.TLM_REF, group);
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
