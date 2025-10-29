/* Manage plugin configuration and erb loading */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fssync from 'fs';
import * as fs from 'fs/promises';
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
    let contents = await fs.readFile(path, 'utf-8');

    for (const [re, value] of patternReplace) {
      contents = contents.replace(new RegExp(re, 'g'), value);
    }

    const lines = contents.split(/\r?\n/);
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
      const erbResult = await parseERB(this.outputChannel, this.path, contents, erbVars);
      const erbLines = erbResult.split(/\r?\n/);
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

function searchPath(startDir: string, fileName: string): string | undefined {
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
    if (fssync.existsSync(configPath)) {
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

function searchRubyRequire(startDir: string, rubyRequireName: string): string | undefined {
  if (!rubyRequireName.endsWith('.rb')) {
    rubyRequireName = `${rubyRequireName}.rb`;
  }
  return searchPath(startDir, rubyRequireName);
}

export class CosmosProjectSearch {
  private outputChannel: vscode.OutputChannel;

  public constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
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

    if (!filePath.includes('cmd_tlm')) {
      targetNames.push(path.basename(pluginDir));
      return targetNames;
    }

    for (const [targetName, targetFolder] of pluginConfig.targets) {
      if (filePath.split(path.sep).includes(targetFolder)) {
        targetNames.push(targetName);
      }
    }

    return targetNames;
  }

  public getPluginConfig(startDir: string): [CosmosPluginConfig, string] {
    const configPath = searchPath(startDir, PLUGIN_CONFIG_NAME);
    if (!configPath) {
      return [new CosmosPluginConfig(undefined, this.outputChannel), ''];
    }

    const pluginConfig = new CosmosPluginConfig(configPath, this.outputChannel);
    return [pluginConfig, path.dirname(configPath)];
  }

  public async getERBConfig(startDir: string): Promise<CosmosERBConfig> {
    const configPath = searchPath(startDir, ERB_CONFIG_NAME);
    if (!configPath) {
      return {
        path: undefined,
        variables: new Map<string, string>(),
        patterns: new Map<string, string>(),
      };
    }

    const fileContent = await fs.readFile(configPath, 'utf-8');
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
    const erbConfig = await this.getERBConfig(path.dirname(filePath));
    const [plugin, pluginPath] = this.getPluginConfig(path.dirname(filePath));
    await plugin.parse(erbConfig);

    const derivedTargetNames = this.deriveTargetNames(plugin, pluginPath, filePath);

    let contents = await fs.readFile(filePath, 'utf-8');
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

    const parsed = await parseERB(this.outputChannel, filePath, contents, variables);
    return parsed.replace(/^(?:\s*[\r\n]){1,}/gm, '');
  }
}

const erbContentsRegex = /<%=?\s*([\s\S]*?)\s*%>/g;
const requireRegex = /(require(?:\(|\s)['"][^'"]+['"](?:\)|\s)?)/g;
const requireFileRegex = /['"]([^'"]+)['"]/;

function simpleHash(str: string): number {
  let hash = 5381;
  let i = str.length;
  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }
  return hash >>> 0;
}

async function resolveRequires(
  outputChannel: vscode.OutputChannel,
  filePath: string,
  contents: string,
  pathStack: Set<string> = new Set<string>()
): Promise<string> {
  let text = contents;

  const erbContentsMatches = text.matchAll(erbContentsRegex);
  if (!erbContentsMatches) {
    return text;
  }

  for (const erbMatch of erbContentsMatches) {
    const [_, erbInner] = erbMatch;
    if (!erbInner) {
      continue;
    }

    const requireMatches = erbInner.matchAll(requireRegex);
    for (const requireMatch of requireMatches) {
      const [_, requireOuter] = requireMatch;
      if (!requireOuter) {
        continue;
      }

      const fileMatch = requireOuter.match(requireFileRegex);
      if (!fileMatch) {
        continue;
      }

      const [__, rubyRequireName] = fileMatch;
      if (!rubyRequireName) {
        continue;
      }

      const startDir = path.dirname(filePath);
      const rubyFileMatch = searchRubyRequire(startDir, rubyRequireName);
      if (rubyFileMatch === undefined) {
        continue;
      }

      if (pathStack.has(rubyFileMatch)) {
        outputChannel.appendLine('Require recursion terminated on same include');
        text = text.replace(requireOuter, ''); // Remove require statement
        continue; // End recursion, file is already on the stack
      }
      pathStack.add(rubyFileMatch);

      const rubyFileContents = await fs.readFile(rubyFileMatch, 'utf-8');

      // Recursively do this again to match sub requires and so on...
      const updated = text.replace(requireOuter, rubyFileContents);
      text = await resolveRequires(outputChannel, filePath, updated, pathStack);
    }
  }

  outputChannel.append(text);
  outputChannel.show(true);

  return text;
}

export async function parseERB(
  outputChannel: vscode.OutputChannel,
  filePath: string,
  contents: string,
  variables: Map<string, string>
): Promise<string> {
  let text = await resolveRequires(outputChannel, filePath, contents);

  text = text.replace(/^\s*#.*$/gm, ''); /* Remove comments */
  return await erb({
    template: text,
    data: {
      values: Object.fromEntries(variables),
    },
    timeout: 5000,
  });
}
