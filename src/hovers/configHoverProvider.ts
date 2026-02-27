import * as vscode from 'vscode';
import { KeywordDoc } from './configKeywordDocs';

const KEYWORD_PATTERN = /[A-Z][A-Z0-9_]*/;

export class ConfigHoverProvider implements vscode.HoverProvider {
  constructor(private keywords: Record<string, KeywordDoc>) {}

  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.Hover | undefined {
    const wordRange = document.getWordRangeAtPosition(position, KEYWORD_PATTERN);
    if (!wordRange) {
      return undefined;
    }

    const word = document.getText(wordRange);
    const doc = this.keywords[word];
    if (!doc) {
      return undefined;
    }

    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${word}**\n\n`);
    md.appendMarkdown(`${doc.summary}\n\n`);
    md.appendCodeblock(doc.syntax, 'plaintext');

    if (doc.parameters && doc.parameters.length > 0) {
      md.appendMarkdown('\n**Parameters:**\n\n');
      for (const p of doc.parameters) {
        const req = p.required ? 'required' : 'optional';
        let line = `- \`${p.name}\` _(${req})_ — ${p.description}`;
        if (p.values && p.values.length > 0) {
          line += ` Values: ${p.values.map((v) => `\`${v}\``).join(', ')}`;
        }
        md.appendMarkdown(`${line}\n`);
      }
    }

    return new vscode.Hover(md, wordRange);
  }
}
