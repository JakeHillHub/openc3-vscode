/**
 * Common completions provider to support all cosmos configurations
 */
import * as vscode from 'vscode';
import * as common from './cosmosCompletionTypes';

export class CosmosConfigurationCompletion implements vscode.CompletionItemProvider {
  private outputChannel: vscode.OutputChannel;
  /* Completions that require no line context */
  private topLevelCompletions: vscode.CompletionItem[] = [];
  private triggerChars: Set<string> = new Set<string>();

  private completionDefinitions: common.CompletionDefinition[] = [];
  private contextualDefinitions: common.ContextualDefinition[] = [];

  constructor(
    outputChannel: vscode.OutputChannel,
    completionDefinitions: common.CompletionDefinition[],
    contextualDefinitions: common.ContextualDefinition[]
  ) {
    this.outputChannel = outputChannel;
    this.completionDefinitions = completionDefinitions;
    this.contextualDefinitions = contextualDefinitions;

    this.preComputeStaticCompletions(completionDefinitions);

    let sumContextualCompletions = contextualDefinitions.length;
    for (const definition of contextualDefinitions) {
      sumContextualCompletions += definition.choices.length;
    }
    this.outputChannel.appendLine(
      `Created ${this.topLevelCompletions.length} static completions and ${sumContextualCompletions} context aware completions`
    );
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

    return `\${${index}:<${arg.title}>}`;
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

  private preComputeStaticCompletions(completions: common.CompletionDefinition[]) {
    for (const completionDefinition of completions) {
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

    for (const contextualDefinition of this.contextualDefinitions) {
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
    for (const completionDefinition of this.completionDefinitions) {
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
