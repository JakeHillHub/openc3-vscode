import * as vscode from 'vscode';

export class CosmosApiCompletionProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const cmdItem = this.completionItem(
            'cmd',
            '(target, command, **params)',
            'Sends a command to the specified target'
        );
        const tlmItem = this.completionItem(
            'tlm',
            '(target, packet)',
            'Get the current telemetry values of a specfied packet'
        );
        // TODO: Add the rest
        return [cmdItem, tlmItem];
    }

    private completionItem(
        text: string,
        detail: string,
        markdownString: string
    ): vscode.CompletionItem {
        const item = new vscode.CompletionItem(text);
        item.kind = vscode.CompletionItemKind.Function;
        item.detail = detail;
        item.documentation = new vscode.MarkdownString(markdownString);
        return item;
    }
}
