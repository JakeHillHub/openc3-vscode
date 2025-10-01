import * as vscode from 'vscode';
import * as common from './cosmosCompletionCommon';

const descAndEndian: common.CompletionArgument[] = [
  {
    title: 'DESCRIPTION',
    options: ['""'],
    required: false,
  },
  {
    title: 'ENDIANNESS',
    options: common.endianOpts,
    required: false,
  },
];

const contextualDefines: common.ContextualDefinition[] = [
  {
    match: /^(?:APPEND_PARAMETER|PARAMETER)\s+/g,
    choices: [
      {
        condition: /(UINT|INT|FLOAT|DERIVED)/g,
        title: 'INT/FLOAT/DERIVED Parameters',
        args: [
          {
            title: 'MINIMUM_VALUE',
            options: common.typeMinConstants,
            optionTransformer: common.magicalTypeConstants,
            required: true,
          },
          {
            title: 'MAXIMUM_VALUE',
            options: common.typeMaxConstants,
            optionTransformer: common.magicalTypeConstants,
            required: true,
          },
          {
            title: 'DEFAULT_VALUE',
            options: common.typeDefaultConstants,
            optionTransformer: common.magicalTypeConstants,
            required: true,
          },
          ...descAndEndian,
        ],
      },
      {
        condition: /(STRING|BLOCK)/g,
        title: 'STRING/BLOCK Default Value',
        args: [
          {
            title: 'DEFAULT_VALUE',
            options: ['""'],
            required: true,
          },
          ...descAndEndian,
        ],
      },
    ],
  },
  {
    match: /^(?:APPEND_ID_PARAMETER|ID_PARAMETER)\s+/g,
    choices: [
      {
        condition: /(UINT|INT|FLOAT|DERIVED)/g,
        title: 'ID Parameters',
        args: [
          {
            title: 'ID_MINIMUM_VALUE',
            options: common.typeMinConstants,
            optionTransformer: common.idTypeConstants,
            required: true,
          },
          {
            title: 'ID_MAXIMUM_VALUE',
            options: common.typeMaxConstants,
            optionTransformer: common.idTypeConstants,
            required: true,
          },
          {
            title: 'ID_VALUE',
            options: common.typeDefaultConstants,
            optionTransformer: common.idTypeConstants,
            required: true,
          },
          ...descAndEndian,
        ],
      },
      {
        condition: /(STRING|BLOCK)/g,
        title: 'STRING/BLOCK Default Value',
        args: [
          {
            title: 'ID_STR_VALUE',
            options: ['""'],
            required: true,
          },
          ...descAndEndian,
        ],
      },
    ],
  },
];

const commonParamRequiredArgs = [
  {
    title: 'NAME',
    options: [''],
    required: true,
  },
  {
    title: 'BIT_OFFSET',
    options: [''],
    required: true,
  },
  {
    title: 'BIT_SIZE',
    options: common.frequentlyUsedBitSize,
    required: true,
  },
  {
    title: 'DATA_TYPE',
    options: common.typeConstants,
    required: true,
  },
];

const commonAppendParamRequiredArgs = [
  {
    title: 'NAME',
    options: [''],
    required: true,
  },
  {
    title: 'BIT_SIZE',
    options: common.frequentlyUsedBitSize,
    required: true,
  },
  {
    title: 'DATA_TYPE',
    options: common.typeConstants,
    required: true,
  },
];

const completionDefines: common.CompletionDefinition[] = [
  {
    title: 'COMMAND',
    args: [
      {
        title: 'TARGET',
        options: ['<%= target_name %>'],
        required: true,
      },
      {
        title: 'COMMAND_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ENDIANNESS',
        options: common.endianOpts,
        required: true,
      },
      {
        title: 'DESCRIPTION',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'PARAMETER',
    args: commonParamRequiredArgs,
  },
  {
    title: 'ID_PARAMETER',
    args: commonParamRequiredArgs,
  },
  {
    title: 'APPEND_PARAMETER',
    args: commonAppendParamRequiredArgs,
  },
  {
    title: 'APPEND_ID_PARAMETER',
    args: commonAppendParamRequiredArgs,
  },
  {
    title: 'APPEND_ARRAY_PARAMETER',
    args: [
      {
        title: 'NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ITEM_BIT_SIZE',
        options: common.frequentlyUsedBitSize,
        required: true,
      },
      {
        title: 'ITEM_DATA_TYPE',
        options: common.typeConstants,
        required: true,
      },
      {
        title: 'ARRAY_BIT_SIZE',
        options: [''],
        required: true,
      },
      ...descAndEndian,
    ],
  },
  {
    title: 'ARRAY_PARAMETER',
    args: [
      {
        title: 'NAME',
        options: [''],
        required: true,
      },
      {
        title: 'BIT_OFFSET',
        options: [''],
        required: true,
      },
      {
        title: 'ITEM_BIT_SIZE',
        options: common.frequentlyUsedBitSize,
        required: true,
      },
      {
        title: 'ITEM_DATA_TYPE',
        options: common.typeConstants,
        required: true,
      },
      {
        title: 'ARRAY_BIT_SIZE',
        options: [''],
        required: true,
      },
      ...descAndEndian,
    ],
  },
  {
    title: 'SELECT_PARAMETER',
    args: [
      {
        title: 'PARAMETER_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'DELETE_PARAMETER',
    args: [
      {
        title: 'PARAMETER_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'HIDDEN',
    args: [],
  },
  {
    title: 'DISABLED',
    args: [],
  },
  {
    title: 'DISABLE_MESSAGES',
    args: [],
  },
  {
    title: 'META',
    args: [
      {
        title: 'META_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'META_VALUES',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'HAZARDOUS',
    args: [
      {
        title: 'DESCRIPTION',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'ACCESSOR',
    args: [
      {
        title: 'ACCESSOR_CLASS_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ARGUMENT',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'TEMPLATE',
    args: [
      {
        title: 'TEMPLATE_STR',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'TEMPLATE_FILE',
    args: [
      {
        title: 'FILE_PATH',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'RESPONSE',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'PACKET_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'ERROR_RESPONSE',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'PACKET_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'RELATED_ITEM',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'PACKET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ITEM_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'SCREEN',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'SCREEN_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'VIRTUAL',
    args: [],
  },
  {
    title: 'RESTRICTED',
    args: [],
  },
  {
    title: 'VALIDATOR',
    args: [
      {
        title: 'CLASS_FILENAME',
        options: ['""'],
        required: true,
      },
      {
        title: 'ARGUMENT',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'FORMAT_STRING',
    args: [
      {
        title: 'FORMAT',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'UNITS',
    args: [
      {
        title: 'FULL_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ABBREVIATED',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'DESCRIPTION',
    args: [
      {
        title: 'VALUE',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'META',
    args: [
      {
        title: 'META_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'META_VALUES',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'OVERLAP',
    args: [],
  },
  {
    title: 'KEY',
    args: [
      {
        title: 'KEY_STRING',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'VARIABLE_BIT_SIZE',
    args: [
      {
        title: 'LENGTH_ITEM_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'LENGTH_BITS_PER_COUNT',
        options: ['8'],
        required: false,
      },
      {
        title: 'LENGTH_VALUE_BIT_OFFSET',
        options: ['0'],
        required: false,
      },
    ],
  },
  {
    title: 'OBFUSCATE',
    args: [],
  },
  {
    title: 'REQUIRED',
    args: [],
  },
  {
    title: 'MINIMUM_VALUE',
    args: [
      {
        title: 'VALUE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'MAXIMUM_VALUE',
    args: [
      {
        title: 'VALUE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'DEFAULT_VALUE',
    args: [
      {
        title: 'VALUE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'STATE',
    args: [
      {
        title: 'KEY',
        options: [''],
        required: true,
      },
      {
        title: 'VALUE',
        options: [''],
        required: true,
      },
      {
        title: 'OPTIONS',
        options: ['HAZARDOUS', 'DISABLE_MESSAGES'],
        required: false,
      },
      {
        title: 'HAZARDOUS_DESCRIPTION',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'WRITE_CONVERSION',
    args: [
      {
        title: 'CLASS_FILENAME',
        options: ['""'],
        required: true,
      },
      {
        title: 'PARAMETER',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'POLY_WRITE_CONVERSION',
    args: [
      {
        title: 'C0',
        options: [''],
        required: true,
      },
      ...Array.from({ length: 10 }, () => {
        return { title: 'Cx', options: [''], required: false };
      }),
    ],
  },
  {
    title: 'SEG_POLY_WRITE_CONVERSION',
    args: [
      {
        title: 'LOWER_BOUND',
        options: [''],
        required: true,
      },
      {
        title: 'C0',
        options: [''],
        required: true,
      },
      ...Array.from({ length: 10 }, () => {
        return { title: 'Cx', options: [''], required: false };
      }),
    ],
  },
  {
    title: 'GENERIC_WRITE_CONVERSION_START',
    args: [],
  },
  {
    title: 'GENERIC_WRITE_CONVERSION_END',
    args: [],
  },
  {
    title: 'OVERFLOW',
    args: [
      {
        title: 'BEHAVIOR',
        options: ['ERROR', 'ERROR_ALLOW_HEX', 'TRUNCATE', 'SATURATE'],
        required: true,
      },
    ],
  },
];

export class CosmosCmdCompletion implements vscode.CompletionItemProvider {
  private outputChannel: vscode.OutputChannel;
  /* Completions that require no line context */
  private topLevelCompletions: vscode.CompletionItem[] = [];
  private triggerChars: Set<string> = new Set<string>();

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;

    this.generateCompletions();
    this.outputChannel.appendLine(`Created ${this.topLevelCompletions.length} cmd completions`);
  }

  public getTriggerChars(): string[] {
    /* Add space char to trigger chars */
    return [...Array.from(this.triggerChars), ' '].sort();
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const line = document.lineAt(position.line);

    let linePrefix = document.getText(new vscode.Range(line.range.start, position));
    linePrefix = linePrefix.trim();

    /* On first char typed */
    if (linePrefix.length === 1 && this.triggerChars.has(linePrefix[0])) {
      return this.topLevelCompletions;
    }

    /* When extra info starts to get appended to the required params of a line */
    if (position.character === line.text.length) {
      return this.computContextualCompletions(linePrefix);
    }

    return undefined;
  }

  private generateTabstopArg(arg: common.CompletionArgument, index: number): string {
    if (arg.options.length > 1) {
      return `\${${index}|${arg.options.join(',')}|}`;
    }

    const placeholder = arg.options[0] || '';
    if (placeholder === '""' || placeholder === "''") {
      return `"\${${index}}"`;
    }

    if (placeholder) {
      return `\${${index}:${placeholder}}`;
    }

    return `\${${index}:${arg.title}}`;
  }

  private generateNoCtxRequiredTabstopArgs(args: common.CompletionArgument[]): string {
    const tabstopArgs: string[] = [];

    let index = 1;
    for (const arg of args) {
      if (arg.required) {
        tabstopArgs.push(this.generateTabstopArg(arg, index));
        index++;
      }
    }
    return tabstopArgs.join(' ');
  }

  private generateCtxTabstopArg(
    linePrefix: string,
    arg: common.CompletionArgument,
    index: number
  ): string {
    if (!arg.optionTransformer) {
      /* Default if no transformer is defined */
      return this.generateTabstopArg(arg, index);
    }

    const options = arg.optionTransformer(linePrefix, arg, index);
    if (options === undefined) {
      return this.generateTabstopArg(arg, index);
    }

    return options;
  }

  private generateCtxRequiredTabstopArgs(
    linePrefix: string,
    args: common.CompletionArgument[]
  ): string {
    const tabstopArgs: string[] = [];

    let index = 1;
    for (const arg of args) {
      if (arg.required) {
        tabstopArgs.push(this.generateCtxTabstopArg(linePrefix, arg, index));
        index++;
      }
    }
    return tabstopArgs.join(' ');
  }

  private generateCompletionFromDefinition(d: common.CompletionDefinition): vscode.CompletionItem {
    const item = new vscode.CompletionItem(d.title, vscode.CompletionItemKind.Snippet);
    item.detail = `(snippet) Inserts a full ${d.title} definition.`;

    const argsString = this.generateNoCtxRequiredTabstopArgs(d.args);
    const snippet = new vscode.SnippetString(`${d.title} ${argsString}`);

    item.insertText = snippet;
    return item;
  }

  private generateCompletions() {
    for (const completionDefinition of completionDefines) {
      this.topLevelCompletions.push(this.generateCompletionFromDefinition(completionDefinition));
      /* Add first char of title to trigger set */
      this.triggerChars.add(completionDefinition.title[0]);
    }
  }

  private createOptionalTabstopArg(currentArg: common.CompletionArgument): vscode.CompletionItem {
    const tabstopArg = this.generateTabstopArg(currentArg, 1); /* Always at tabstop index 1 */
    const completionItem = new vscode.CompletionItem(
      currentArg.title,
      vscode.CompletionItemKind.Snippet
    );
    const snippet = new vscode.SnippetString(tabstopArg);
    completionItem.insertText = snippet;
    return completionItem;
  }

  private matchContextualDefinition(
    primaryDefinition: common.CompletionDefinition,
    linePrefix: string
  ): vscode.CompletionItem[] {
    const completionItems: vscode.CompletionItem[] = [];

    const numPrimaryArgs = primaryDefinition.args.length;

    for (const contextualDefinition of contextualDefines) {
      const match = linePrefix.match(contextualDefinition.match);
      if (!match) {
        continue;
      }

      for (const choice of contextualDefinition.choices) {
        if (!linePrefix.match(choice.condition)) {
          continue;
        }

        const currArgIndex = common.getArgumentIndex(linePrefix);
        const numRequired = this.getNumRequiredArgs(choice);

        /* In the optional contextual range */
        if (currArgIndex >= numPrimaryArgs + numRequired) {
          const choiceIndex = currArgIndex - numPrimaryArgs;
          const currentArg = choice.args[choiceIndex];
          if (currentArg?.required) {
            return completionItems; /* Awkward spot, just stop trying */
          }
          completionItems.push(this.createOptionalTabstopArg(currentArg));
          return completionItems;
        } else {
          /* Contextual required range */
          const tabstopArgs = this.generateCtxRequiredTabstopArgs(linePrefix, choice.args);
          const snippet = new vscode.SnippetString(`${tabstopArgs}`);
          const completionItem = new vscode.CompletionItem(
            choice.title,
            vscode.CompletionItemKind.Snippet
          );
          completionItem.insertText = snippet;
          completionItems.push(completionItem);
        }
      }
    }

    return completionItems;
  }

  private findDefinitionFromPrefix(linePrefix: string): common.CompletionDefinition | undefined {
    for (const completionDefinition of completionDefines) {
      if (linePrefix.startsWith(completionDefinition.title)) {
        return completionDefinition;
      }
    }

    return undefined;
  }

  private getNumRequiredArgs(definition: common.CompletionDefinition | common.ContextualChoice) {
    let numRequired = 0;
    for (const arg of definition.args) {
      if (arg.required) {
        numRequired++;
      }
    }
    return numRequired;
  }

  private computContextualCompletions(linePrefix: string): vscode.CompletionItem[] {
    /* First find primary definition */
    const definition = this.findDefinitionFromPrefix(linePrefix);
    if (definition === undefined) {
      return [];
    }

    /* Check if contextual definition matches exist */
    const completionItems: vscode.CompletionItem[] = this.matchContextualDefinition(
      definition,
      linePrefix
    );
    if (completionItems.length > 0) {
      return completionItems;
    }

    const currentArgIndex = common.getArgumentIndex(linePrefix);
    if (currentArgIndex >= definition.args.length) {
      return completionItems;
    }

    const currentArg = definition.args[currentArgIndex];
    if (currentArg?.required) {
      return completionItems;
    }

    completionItems.push(this.createOptionalTabstopArg(currentArg));
    return completionItems;
  }
}
