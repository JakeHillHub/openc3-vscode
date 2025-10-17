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
    match:
      /(?:cmd|cmd_no_range_check|cmd_no_hazardous_check|cmd_no_checks|cmd_raw|cmd_raw_no_range_check|cmd_raw_no_hazardous_check|cmd_raw_no_checks)\((.*?)\)/,
    group: {
      type: GroupType.CMD_REF,
      methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
      args: [
        { title: 'TARGET', source: ArgSource.CMD_TARGET },
        { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
        { title: 'PARAMETERS', source: ArgSource.CMD_PARAMS },
      ],
    },
  },
  {
    match: /(?:get_cmd|get_cmd_buffer|get_cmd_hazardous|get_cmd_cnt)\((.*?)\)/,
    group: {
      type: GroupType.CMD_REF,
      methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
      args: [
        { title: 'TARGET', source: ArgSource.CMD_TARGET },
        { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
      ],
    },
  },
  {
    match: /(?:get_cmd_time)\((.*?)\)/,
    group: {
      type: GroupType.CMD_REF,
      methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
      args: [
        { title: 'TARGET', source: ArgSource.CMD_TARGET },
        { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
      ],
    },
  },
  {
    match: /(?:get_param)\((.*?)\)/,
    group: {
      type: GroupType.CMD_REF,
      methods: [CMethods.COMMAND_INLINE, CMethods.COMMAND_POSITIONAL],
      args: [
        { title: 'TARGET', source: ArgSource.CMD_TARGET },
        { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
        { title: 'PARAMETER_NAME', source: ArgSource.CMD_PARAM_NAME },
      ],
    },
  },
  {
    match: /(?:get_cmd_value)\((.*?)\)/,
    group: {
      type: GroupType.CMD_REF,
      methods: [CMethods.COMMAND_POSITIONAL],
      args: [
        { title: 'TARGET', source: ArgSource.CMD_TARGET },
        { title: 'MNEMONIC', source: ArgSource.CMD_MNEMONIC },
        { title: 'PARAMETER_NAME', source: ArgSource.CMD_PARAM_NAME },
      ],
    },
  },
  {
    match: /(?:tlm|tlm_raw|tlm_formatted|tlm_with_units|get_item|normalize_tlm)\((.*?)\)/,
    group: {
      type: GroupType.TLM_REF,
      methods: [CMethods.TELEMETRY_INLINE, CMethods.TELEMETRY_POSITIONAL],
      args: [
        { title: 'TARGET', source: ArgSource.TLM_TARGET },
        { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
        { title: 'FIELDS', source: ArgSource.TLM_FIELD },
      ],
    },
  },
  {
    match: /(?:get_tlm_buffer|get_tlm_packet|get_tlm|get_tlm_cnt)\((.*?)\)/,
    group: {
      type: GroupType.TLM_REF,
      methods: [CMethods.TELEMETRY_INLINE, CMethods.TELEMETRY_POSITIONAL],
      args: [
        { title: 'TARGET', source: ArgSource.TLM_TARGET },
        { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
      ],
    },
  },
  {
    match: /(?:get_all_tlm|get_all_tlm_names|get_all_tlm_item_names)\((.*?)\)/,
    group: {
      type: GroupType.TLM_REF,
      methods: [CMethods.TELEMETRY_POSITIONAL],
      args: [{ title: 'TARGET', source: ArgSource.TLM_TARGET }],
    },
  },
  {
    match: /(?:check|check_raw|check_formatted|check_with_units|wait_check)\((.*?)\)/,
    group: {
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
  },
  {
    match: /(?:set_tlm|override_tlm)\((.*?)\)/,
    group: {
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
  },
  {
    match: /(?:wait_tolerance|wait_check_tolerance)\((.*?)\)/,
    group: {
      type: GroupType.TLM_REF,
      methods: [CMethods.TELEMETRY_INLINE],
      args: [
        { title: 'TARGET', source: ArgSource.TLM_TARGET },
        { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
        { title: 'FIELDS', source: ArgSource.TLM_FIELD },
      ],
    },
  },
  {
    match: /(?:wait_packet|wait_check_packet|inject_tlm)\((.*?)\)/,
    group: {
      type: GroupType.TLM_REF,
      methods: [CMethods.TELEMETRY_POSITIONAL],
      args: [
        { title: 'TARGET', source: ArgSource.TLM_TARGET },
        { title: 'MNEMONIC', source: ArgSource.TLM_MNEMONIC },
      ],
    },
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
