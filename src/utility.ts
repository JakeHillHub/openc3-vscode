/**
 * General utility stuff that doesn't fit in
 */

import * as vscode from 'vscode';
import * as fs from 'fs/promises';

/**
 * NOTE: this acts as a "trailing edge debounce" keep your timeout/wait very short
 * to avoid excessive delays and unresponsiveness
 * @param func function to debounce
 * @param wait milliseconds
 * @returns {any} composition
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>) => {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export class UpdateSettingsFlag {
  private isUpdatingSettings: number = 0;

  public isSet(): boolean {
    return this.isUpdatingSettings > 0;
  }

  public set() {
    this.isUpdatingSettings++;
  }

  public clear() {
    this.isUpdatingSettings--;
  }
}

/**
 * Spoof an invisible user edit to force an editor refresh.
 * Ugly hack to force pylance to reevaluate pyfile when load_utility stubs are generated
 */
export function triggerEditorRefresh() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const position = editor.selection.active;

  // Use editor.edit to perform a quick insert and delete
  editor
    .edit((editBuilder) => {
      editBuilder.insert(position, ' ');
    })
    .then(() => {
      editor.edit((editBuilder) => {
        const endPosition = position.translate(0, 1);
        const rangeToDelete = new vscode.Range(position, endPosition);
        editBuilder.delete(rangeToDelete);
      });
    });
}

export class FileManagedSection {
  protected managedMarkerStart: string;
  protected managedMarkerEnd: string;
  protected outputChannel: vscode.OutputChannel;
  protected filePath: string;

  private contentsRegex: RegExp;
  private fullBlockRegex: RegExp;

  constructor(
    filePath: string,
    markerStart: string,
    markerEnd: string,
    outputChannel: vscode.OutputChannel
  ) {
    this.managedMarkerStart = markerStart;
    this.managedMarkerEnd = markerEnd;
    this.outputChannel = outputChannel;
    this.filePath = filePath;

    this.contentsRegex = new RegExp(`${this.managedMarkerStart}(.+?)${this.managedMarkerEnd}`, 's');
    this.fullBlockRegex = new RegExp(
      `${this.managedMarkerStart}(.+?)${this.managedMarkerEnd}`,
      'sg'
    );
  }

  /**
   * delete managed section
   */
  protected async removeSection() {
    try {
      /* Cleanup after ourselves if disabled by user */
      await fs.access(this.filePath);
      const contents = await fs.readFile(this.filePath, 'utf-8');
      if (contents.match(this.contentsRegex)) {
        /* Block already exists, remove it */
        const writeBack = contents.replace(this.fullBlockRegex, '');
        await fs.writeFile(this.filePath, writeBack);
      }
    } catch (err) {
      return; /* No this.filePath, no worries */
    }
    return;
  }

  /**
   * Ensure this.filePath exists if not already created.
   */
  protected async initializeSection(...initialLines: string[]) {
    try {
      await fs.access(this.filePath);
    } catch (err) {
      await fs.writeFile(this.filePath, `${this.managedMarkerStart}\n${this.managedMarkerEnd}`);
    }

    for (const l of initialLines) {
      await this.addLine(l);
    }
  }

  protected async updateAllLines(lines: string[]) {
    const existingLines = await this.getLines();
    if (existingLines === undefined) {
      return; /* Checks for managed section */
    }
    this.setLines(lines);
  }

  protected async addLine(line: string) {
    const lines = await this.getLines();
    if (lines === undefined) {
      return;
    }

    const lineSet = new Set<string>();
    for (const l of lines) {
      lineSet.add(l);
    }
    lineSet.add(line);

    const writeBackLines = [];
    for (const l of lineSet) {
      writeBackLines.push(l);
    }

    await this.setLines(writeBackLines);
  }

  /**
   * Get managed section from this.filePath, if it does not exist will retry to create it
   * @param _writeBack internal use only, do not specify
   * @returns {Promise<string[] | undefined>} each line as a list
   */
  protected async getLines(_writeBack?: boolean): Promise<string[] | undefined> {
    try {
      const contents = await fs.readFile(this.filePath, 'utf-8');
      const sectionMatch = contents.match(this.contentsRegex);
      if (!sectionMatch) {
        if (_writeBack) {
          return undefined; /* Prevent infinite retry recursion */
        }

        const intializeBlock =
          contents + `\n\n${this.managedMarkerStart}\n${this.managedMarkerEnd}\n`;
        await fs.writeFile(this.filePath, intializeBlock);
        return await this.getLines(true); /* Retry with section added */
      }

      const [_, section] = sectionMatch;
      const sectionLines = section.trim().split(/\r?\n/);
      const retLines = [];
      for (const line of sectionLines) {
        if (line === '') {
          continue;
        }
        retLines.push(line.trim());
      }
      return retLines;
    } catch (err) {
      this.outputChannel.appendLine(`error reading ${this.filePath} managed section ${err}`);
      return undefined;
    }
  }

  /**
   * @param lines lines to set directly
   */
  private async setLines(lines: string[]) {
    try {
      const contents = await fs.readFile(this.filePath, 'utf-8');
      const newBlock = `${this.managedMarkerStart}\n${lines.join('\n')}\n${this.managedMarkerEnd}`;
      const replaced = contents.replace(this.fullBlockRegex, newBlock);
      await fs.writeFile(this.filePath, replaced);
    } catch (err) {
      this.outputChannel.appendLine(`failed to set lines in ${this.filePath} ${err}`);
    }
  }
}
