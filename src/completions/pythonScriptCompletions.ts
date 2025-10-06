import * as vscode from 'vscode';
import {
  CosmosScriptCompletionProvider,
  GroupType,
  CMethods,
  ArgSource,
  Language,
} from './cosmosScriptCompletion';
import { CosmosCmdTlmDB } from '../cosmos/cmdTlm';

const boolOpts = ['True', 'False'];

const completionDefinitions = [
  {
    triggers: [] /* Characters that may trigger this completion ie. cmd_raw(<- trigger */,
    match:
      /.*?(?:cmd|cmd_no_range_check|cmd_no_hazardous_check|cmd_no_checks|cmd_raw|cmd_raw_no_range_check|cmd_raw_no_hazardous_check|cmd_raw_no_checks)\((.*?)\).*?/,
    groups: [
      {
        type: GroupType.CMD_TLM_REF,
        methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.CMD_TARGET },
          { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
          { title: 'PARAMETERS', source: ArgSource.CMD_PARAMS },
        ],
      },
      {
        type: GroupType.API_FN_ARGS,
        methods: [CMethods.COMMAND_OPTIONAL_KWD],
        args: [
          { title: 'timeout', source: ArgSource.OPTIONS, options: ['5'] },
          { title: 'log_message', source: ArgSource.OPTIONS, options: boolOpts },
          { title: 'validate', source: ArgSource.OPTIONS, options: boolOpts },
        ],
      },
    ],
  },
];

export function createPyScriptCompletions(
  outputChannel: vscode.OutputChannel,
  cmdTlmDB: CosmosCmdTlmDB
): CosmosScriptCompletionProvider {
  return new CosmosScriptCompletionProvider(
    outputChannel,
    completionDefinitions,
    Language.PYTHON,
    cmdTlmDB
  );
}
