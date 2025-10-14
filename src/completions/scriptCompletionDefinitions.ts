import * as vscode from 'vscode';
import {
  CosmosScriptCompletionProvider,
  GroupType,
  CMethods,
  ArgSource,
  Language,
} from './cosmosScriptCompletion';
import { CosmosCmdTlmDB } from '../cosmos/cmdTlm';

const completionDefinitions = [
  {
    triggers: [] /* Characters that may trigger this completion ie. cmd_raw(<- trigger */,
    match:
      /(?:cmd|cmd_no_range_check|cmd_no_hazardous_check|cmd_no_checks|cmd_raw|cmd_raw_no_range_check|cmd_raw_no_hazardous_check|cmd_raw_no_checks)\((.*?)\)/,
    groups: [
      {
        type: GroupType.CMD_REF,
        methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.CMD_TARGET },
          { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
          { title: 'PARAMETERS', source: ArgSource.CMD_PARAMS },
        ],
      },
    ],
  },
  {
    triggers: [] /* Characters that may trigger this completion ie. cmd_raw(<- trigger */,
    match: /(?:get_cmd|get_cmd_buffer|get_cmd_hazardous|get_cmd_cnt)\((.*?)\)/,
    groups: [
      {
        type: GroupType.CMD_REF,
        methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.CMD_TARGET },
          { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
        ],
      },
    ],
  },
  {
    triggers: [] /* Characters that may trigger this completion ie. cmd_raw(<- trigger */,
    match: /(?:get_cmd_time)\((.*?)\)/,
    groups: [
      {
        type: GroupType.CMD_REF,
        methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.CMD_TARGET },
          { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
        ],
      },
    ],
  },
  {
    triggers: [] /* Characters that may trigger this completion ie. cmd_raw(<- trigger */,
    match: /(?:get_param)\((.*?)\)/,
    groups: [
      {
        type: GroupType.CMD_REF,
        methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.CMD_TARGET },
          { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
          { title: 'PARAMETER_NAME', source: ArgSource.CMD_PARAM_NAME },
        ],
      },
    ],
  },
  {
    triggers: [] /* Characters that may trigger this completion ie. cmd_raw(<- trigger */,
    match: /(?:get_cmd_value)\((.*?)\)/,
    groups: [
      {
        type: GroupType.CMD_REF,
        methods: [CMethods.COMMAND_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.CMD_TARGET },
          { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
          { title: 'PARAMETER_NAME', source: ArgSource.CMD_PARAM_NAME },
        ],
      },
    ],
  },
  {
    triggers: [],
    match: /(?:tlm|tlm_raw|tlm_formatted|tlm_with_units|get_item|normalize_tlm)\((.*?)\)/,
    groups: [
      {
        type: GroupType.TLM_REF,
        methods: [CMethods.TELEMETRY_INLINE, CMethods.TELEMETRY_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.TLM_TARGET },
          { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
          { title: 'FIELDS', source: ArgSource.TLM_FIELD },
        ],
      },
    ],
  },
  {
    triggers: [],
    match: /(?:get_tlm_buffer|get_tlm_packet|get_tlm|get_tlm_cnt)\((.*?)\)/,
    groups: [
      {
        type: GroupType.TLM_REF,
        methods: [CMethods.TELEMETRY_INLINE, CMethods.TELEMETRY_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.TLM_TARGET },
          { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
        ],
      },
    ],
  },
  {
    triggers: [],
    match: /(?:get_all_tlm|get_all_tlm_names|get_all_tlm_item_names)\((.*?)\)/,
    groups: [
      {
        type: GroupType.TLM_REF,
        methods: [CMethods.TELEMETRY_POSITIONAL],
        args: [{ title: 'TARGET', source: ArgSource.TLM_TARGET }],
      },
    ],
  },
  {
    triggers: [],
    match: /(?:check|check_raw|check_formatted|check_with_units|wait_check)\((.*?)\)/,
    groups: [
      {
        type: GroupType.TLM_REF,
        methods: [CMethods.TELEMETRY_INLINE],
        args: [
          { title: 'TARGET', source: ArgSource.TLM_TARGET },
          { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
          { title: 'FIELDS', source: ArgSource.TLM_FIELD },
          {
            title: 'COMPARISON',
            source: ArgSource.TLM_FIELD_COMPARISON,
            options: ['>', '<', '>=', '<=', '==', '!='],
          },
        ],
      },
    ],
  },
  {
    triggers: [],
    match: /(?:set_tlm|override_tlm)\((.*?)\)/,
    groups: [
      {
        type: GroupType.TLM_REF,
        methods: [CMethods.TELEMETRY_INLINE],
        args: [
          { title: 'TARGET', source: ArgSource.TLM_TARGET },
          { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
          { title: 'FIELDS', source: ArgSource.TLM_FIELD },
          {
            title: 'COMPARISON',
            source: ArgSource.TLM_FIELD_COMPARISON,
            options: ['='],
          },
        ],
      },
    ],
  },
  {
    triggers: [],
    match: /(?:wait_tolerance|wait_check_tolerance)\((.*?)\)/,
    groups: [
      {
        type: GroupType.TLM_REF,
        methods: [CMethods.TELEMETRY_INLINE],
        args: [
          { title: 'TARGET', source: ArgSource.TLM_TARGET },
          { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
          { title: 'FIELDS', source: ArgSource.TLM_FIELD },
        ],
      },
    ],
  },
  {
    triggers: [],
    match: /(?:wait_packet|wait_check_packet|inject_tlm)\((.*?)\)/,
    groups: [
      {
        type: GroupType.TLM_REF,
        methods: [CMethods.TELEMETRY_POSITIONAL],
        args: [
          { title: 'TARGET', source: ArgSource.TLM_TARGET },
          { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
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

export function createRbScriptCompletions(
  outputChannel: vscode.OutputChannel,
  cmdTlmDB: CosmosCmdTlmDB
): CosmosScriptCompletionProvider {
  return new CosmosScriptCompletionProvider(
    outputChannel,
    completionDefinitions,
    Language.RUBY,
    cmdTlmDB
  );
}
