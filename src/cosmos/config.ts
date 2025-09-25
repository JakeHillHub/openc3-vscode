/* Manage plugin configuration and erb loading */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import erb from 'erb';

export const TARGET_NAME_ERB_VAR = 'target_name';

const PLUGIN_CONFIG_NAME = 'plugin.txt';
const ERB_CONFIG_NAME = 'openc3-erb.json';

export interface CosmosERBConfig {
  path: string | undefined;
  variables: Map<string, string>;
  patterns: Map<string, string>;
}

const pluginVarExpr = /^VARIABLE\s+(\S+)\s+(.*)$/;
const pluginTargetExpr = /^TARGET\s+(\S+)\s+(\S+)$/;

export async function parseERB(contents: string, variables: Map<string, string>): Promise<string> {
  contents = contents.replace(/^\s*#.*$/gm, ''); /* Remove comments */

  return await erb({
    template: contents,
    data: {
      values: Object.fromEntries(variables),
    },
    timeout: 5000,
  });
}

export class CosmosPluginConfig {
  private outputChannel: vscode.OutputChannel;
  private path: string | undefined;

  public variables: Map<string, string>;
  public targets: Map<string, string>;

  constructor(pluginPath: string | undefined, outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;

    this.path = pluginPath;

    this.variables = new Map<string, string>();
    this.targets = new Map<string, string>();
  }

  private sanitizeVar(val: any): string {
    return val.trim().replace(/^['"`]+|['"`]+$/g, '');
  }

  private async loadFilePatterns(
    path: string,
    patternReplace: Map<string, string>
  ): Promise<string> {
    let contents = await fs.promises.readFile(path, 'utf-8');

    for (const [re, value] of patternReplace) {
      contents = contents.replace(new RegExp(re, 'g'), value);
    }

    const lines = contents.split('\n');
    for (let line of lines) {
      line = line.trim();

      /* VARIABLE lines */
      const varMatch = line.match(pluginVarExpr);
      if (varMatch) {
        const [_, name, value] = varMatch;
        this.variables.set(name, this.sanitizeVar(value));
        continue;
      }
    }

    return contents;
  }

  public async parse(erbConfig: CosmosERBConfig) {
    if (this.path === undefined) {
      return;
    }

    const contents = await this.loadFilePatterns(this.path, erbConfig.patterns);
    const erbVars = new Map<string, string>();
    for (const [key, value] of erbConfig.variables) {
      erbVars.set(key, value);
    }
    for (const [key, value] of this.variables) {
      erbVars.set(key, value);
    }

    try {
      const erbResult = await parseERB(contents, erbVars);
      const erbLines = erbResult.split('\n');
      for (let line of erbLines) {
        line = line.trim();

        /* TARGET lines */
        const targMatch = line.match(pluginTargetExpr);
        if (targMatch) {
          const [_, targetFolder, targetName] = targMatch;
          this.targets.set(targetName, targetFolder);
          continue;
        }
      }
    } catch (err) {
      this.outputChannel.appendLine(`Failed to parse erb for file ${this.path}, ${err}`);
      this.outputChannel.show(true);
      return;
    }
  }
}

export class CosmosProjectSearch {
  private outputChannel: vscode.OutputChannel;

  public constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  private searchPath(startDir: string, fileName: string): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }

    const workspacePaths = workspaceFolders.map((wf) => path.normalize(wf.uri.fsPath));
    let currentDir = path.normalize(startDir);
    let previousDir: string | undefined = undefined;

    while (currentDir !== previousDir) {
      const configPath = path.join(currentDir, fileName);

      // Check if the config file exists
      if (fs.existsSync(configPath)) {
        return configPath;
      }

      // Check if we have hit a workspace folder
      if (workspacePaths.includes(currentDir)) {
        return undefined;
      }

      // Recurse up and check for the infinite loop condition
      previousDir = currentDir;
      currentDir = path.dirname(currentDir);
    }

    return undefined;
  }

  public async getAllTargetDirs(
    excludePattern: string,
    transform: (dir: string) => string
  ): Promise<Set<string>> {
    const targetDirs = new Set<string>();

    const targetFiles = await vscode.workspace.findFiles('**/target.txt', excludePattern);
    for (const targetFile of targetFiles) {
      const targetDir = path.dirname(targetFile.fsPath);
      targetDirs.add(transform(targetDir));
    }

    return targetDirs;
  }

  public deriveTargetNames(
    pluginConfig: CosmosPluginConfig,
    pluginDir: string,
    filePath: string
  ): Array<string> {
    const targetNames = new Array<string>();

    const basename = path.basename(filePath);
    if (basename !== 'cmd.txt' && basename !== 'tlm.txt') {
      targetNames.push(path.basename(pluginDir));
      return targetNames;
    }

    for (const [targetName, targetFolder] of pluginConfig.targets) {
      if (filePath.includes(targetFolder)) {
        targetNames.push(targetName);
      }
    }

    return targetNames;
  }

  public getPluginConfig(startDir: string): [CosmosPluginConfig, string] {
    const configPath = this.searchPath(startDir, PLUGIN_CONFIG_NAME);
    if (!configPath) {
      return [new CosmosPluginConfig(undefined, this.outputChannel), ''];
    }

    const pluginConfig = new CosmosPluginConfig(configPath, this.outputChannel);
    return [pluginConfig, path.dirname(configPath)];
  }

  public getERBConfig(startDir: string): CosmosERBConfig {
    const configPath = this.searchPath(startDir, ERB_CONFIG_NAME);
    if (!configPath) {
      return {
        path: undefined,
        variables: new Map<string, string>(),
        patterns: new Map<string, string>(),
      };
    }

    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    if (parsed === undefined) {
      return {
        path: configPath,
        variables: new Map<string, string>(),
        patterns: new Map<string, string>(),
      };
    }

    const varsMap = new Map<string, string>();
    for (const [key, value] of Object.entries(parsed.variables as Record<string, string>)) {
      varsMap.set(key, value);
    }
    const patternsMap = new Map<string, string>();
    for (const [key, value] of Object.entries(parsed.patterns as Record<string, string>)) {
      patternsMap.set(key, value);
    }

    return {
      path: configPath,
      variables: varsMap,
      patterns: patternsMap,
    };
  }

  public async getERBParseResult(filePath: string): Promise<string> {
    const erbConfig = this.getERBConfig(path.dirname(filePath));
    const [plugin, pluginPath] = this.getPluginConfig(path.dirname(filePath));
    await plugin.parse(erbConfig);

    const derivedTargetNames = this.deriveTargetNames(plugin, pluginPath, filePath);

    let contents = await fs.promises.readFile(filePath, {
      encoding: 'utf-8',
    });
    for (const [re, value] of erbConfig.patterns) {
      contents = contents.replace(new RegExp(re, 'g'), value);
    }

    const variables = new Map<string, string>();
    if (derivedTargetNames.length !== 0) {
      /* Grab the first strictly for visualization */
      variables.set(TARGET_NAME_ERB_VAR, derivedTargetNames[0]);
    }
    for (const [key, value] of Object.entries(erbConfig.variables)) {
      variables.set(key, value);
    }
    for (const [key, value] of plugin.variables) {
      variables.set(key, value);
    }

    const parsed = await parseERB(contents, variables);
    return parsed.replace(/^(?:\s*[\r\n]){1,}/gm, '');
  }
}
