import * as vscode from 'vscode';

import { CosmosCmdTlmDB } from './cosmos';

export class PythonCompletionProvider implements vscode.CompletionItemProvider {
  private cmdTlmDB: CosmosCmdTlmDB;

  constructor(cmdTlmDB: CosmosCmdTlmDB) {
    this.cmdTlmDB = cmdTlmDB;
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.CompletionItem[]> {
    const range = document.getWordRangeAtPosition(
      position.with(position.line, position.character - 1)
    );
    if (!range) {
      return undefined;
    }
    const wordBefore = document.getText(range);

    if (wordBefore === 'cmd') {
      const commandItem = new vscode.CompletionItem('TARGET_ID');
      commandItem.insertText = '"TARGET"';
      return [commandItem];
    } else if (wordBefore === 'tlm') {
      const tlmItem = new vscode.CompletionItem('PACKET_ID');
      tlmItem.insertText = '"PACKET"';
      return [tlmItem];
    }

    return undefined;
  }
}
