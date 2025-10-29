import * as vscode from 'vscode';
import * as common from './cosmosCompletionTypes';
import { CosmosConfigurationCompletion } from './cosmosConfigurationCompletion';

const staticDefinitions: common.CompletionDefinition[] = [
  {
    title: 'LANGUAGE',
    args: [
      {
        title: 'Ruby or Python',
        options: ['ruby', 'python'],
        required: true,
      },
    ],
  },
  {
    title: 'REQUIRE',
    args: [
      {
        title: 'Filename',
        options: [''], // Contextual: Could list files in target/lib or base lib directory
        required: true,
      },
    ],
  },
  {
    title: 'IGNORE_PARAMETER',
    args: [
      {
        title: 'Parameter Name',
        options: [''], // Contextual: Should list ALL command parameter names in the target
        required: true,
      },
    ],
  },
  {
    title: 'IGNORE_ITEM',
    args: [
      {
        title: 'Item name',
        options: [''], // Contextual: Should list ALL telemetry item names in the target
        required: true,
      },
    ],
  },
  {
    title: 'COMMANDS',
    args: [
      {
        title: 'Filename',
        options: [''], // Contextual: Could list *.txt files in target/cmd_tlm directory
        required: true,
      },
    ],
  },
  {
    title: 'TELEMETRY',
    args: [
      {
        title: 'Filename',
        options: [''], // Contextual: Could list *.txt files in target/cmd_tlm directory
        required: true,
      },
    ],
  },
  {
    title: 'CMD_UNIQUE_ID_MODE',
    args: [],
  },
  {
    title: 'TLM_UNIQUE_ID_MODE',
    args: [],
  },
];

export function createTargetCompletions(
  outputChannel: vscode.OutputChannel
): CosmosConfigurationCompletion {
  return new CosmosConfigurationCompletion(
    outputChannel,
    staticDefinitions,
    [],
    'target.txt completion provider'
  );
}
