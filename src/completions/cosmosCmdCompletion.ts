import * as vscode from 'vscode';
import * as common from './cosmosCompletionTypes';
import { CosmosConfigurationCompletion } from './cosmosConfigurationCompletion';

const descAndEndian: common.CompletionArgument[] = [
  {
    title: 'DESCRIPTION',
    options: ['""'],
    required: false,
  },
  {
    title: 'ENDIANNESS',
    options: common.endianOpts,
    required: false,
  },
];

const contextualDefinitions: common.ContextualDefinition[] = [
  {
    match: /^(?:APPEND_PARAMETER|PARAMETER)\s+/g,
    choices: [
      {
        condition: /(UINT|INT|FLOAT|DERIVED)/g,
        title: 'INT/FLOAT/DERIVED Parameters',
        args: [
          {
            title: 'MINIMUM_VALUE',
            options: common.typeMinConstants,
            optionTransformer: common.magicalTypeConstants,
            required: true,
          },
          {
            title: 'MAXIMUM_VALUE',
            options: common.typeMaxConstants,
            optionTransformer: common.magicalTypeConstants,
            required: true,
          },
          {
            title: 'DEFAULT_VALUE',
            options: common.typeDefaultConstants,
            optionTransformer: common.magicalTypeConstants,
            required: true,
          },
          ...descAndEndian,
        ],
      },
      {
        condition: /(STRING|BLOCK)/g,
        title: 'STRING/BLOCK Default Value',
        args: [
          {
            title: 'DEFAULT_VALUE',
            options: ['""'],
            required: true,
          },
          ...descAndEndian,
        ],
      },
    ],
  },
  {
    match: /^(?:APPEND_ID_PARAMETER|ID_PARAMETER)\s+/g,
    choices: [
      {
        condition: /(UINT|INT|FLOAT|DERIVED)/g,
        title: 'ID Parameters',
        args: [
          {
            title: 'ID_MINIMUM_VALUE',
            options: common.typeMinConstants,
            optionTransformer: common.idTypeConstants,
            required: true,
          },
          {
            title: 'ID_MAXIMUM_VALUE',
            options: common.typeMaxConstants,
            optionTransformer: common.idTypeConstants,
            required: true,
          },
          {
            title: 'ID_VALUE',
            options: common.typeDefaultConstants,
            optionTransformer: common.idTypeConstants,
            required: true,
          },
          ...descAndEndian,
        ],
      },
      {
        condition: /(STRING|BLOCK)/g,
        title: 'STRING/BLOCK Default Value',
        args: [
          {
            title: 'ID_STR_VALUE',
            options: ['""'],
            required: true,
          },
          ...descAndEndian,
        ],
      },
    ],
  },
];

const commonParamRequiredArgs = [
  {
    title: 'NAME',
    options: [''],
    required: true,
  },
  {
    title: 'BIT_OFFSET',
    options: [''],
    required: true,
  },
  {
    title: 'BIT_SIZE',
    options: common.frequentlyUsedBitSize,
    required: true,
  },
  {
    title: 'DATA_TYPE',
    options: common.typeConstants,
    required: true,
  },
];

const commonAppendParamRequiredArgs = [
  {
    title: 'NAME',
    options: [''],
    required: true,
  },
  {
    title: 'BIT_SIZE',
    options: common.frequentlyUsedBitSize,
    required: true,
  },
  {
    title: 'DATA_TYPE',
    options: common.typeConstants,
    required: true,
  },
];

const staticDefinitions: common.CompletionDefinition[] = [
  {
    title: 'COMMAND',
    args: [
      {
        title: 'TARGET',
        options: ['<%= target_name %>'],
        required: true,
      },
      {
        title: 'COMMAND_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ENDIANNESS',
        options: common.endianOpts,
        required: true,
      },
      {
        title: 'DESCRIPTION',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'PARAMETER',
    args: commonParamRequiredArgs,
  },
  {
    title: 'ID_PARAMETER',
    args: commonParamRequiredArgs,
  },
  {
    title: 'APPEND_PARAMETER',
    args: commonAppendParamRequiredArgs,
  },
  {
    title: 'APPEND_ID_PARAMETER',
    args: commonAppendParamRequiredArgs,
  },
  {
    title: 'APPEND_ARRAY_PARAMETER',
    args: [
      {
        title: 'NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ITEM_BIT_SIZE',
        options: common.frequentlyUsedBitSize,
        required: true,
      },
      {
        title: 'ITEM_DATA_TYPE',
        options: common.typeConstants,
        required: true,
      },
      {
        title: 'ARRAY_BIT_SIZE',
        options: [''],
        required: true,
      },
      ...descAndEndian,
    ],
  },
  {
    title: 'ARRAY_PARAMETER',
    args: [
      {
        title: 'NAME',
        options: [''],
        required: true,
      },
      {
        title: 'BIT_OFFSET',
        options: [''],
        required: true,
      },
      {
        title: 'ITEM_BIT_SIZE',
        options: common.frequentlyUsedBitSize,
        required: true,
      },
      {
        title: 'ITEM_DATA_TYPE',
        options: common.typeConstants,
        required: true,
      },
      {
        title: 'ARRAY_BIT_SIZE',
        options: [''],
        required: true,
      },
      ...descAndEndian,
    ],
  },
  {
    title: 'SELECT_PARAMETER',
    args: [
      {
        title: 'PARAMETER_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'DELETE_PARAMETER',
    args: [
      {
        title: 'PARAMETER_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'HIDDEN',
    args: [],
  },
  {
    title: 'DISABLED',
    args: [],
  },
  {
    title: 'DISABLE_MESSAGES',
    args: [],
  },
  {
    title: 'META',
    args: [
      {
        title: 'META_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'META_VALUES',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'HAZARDOUS',
    args: [
      {
        title: 'DESCRIPTION',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'ACCESSOR',
    args: [
      {
        title: 'ACCESSOR_CLASS_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ARGUMENT',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'TEMPLATE',
    args: [
      {
        title: 'TEMPLATE_STR',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'TEMPLATE_FILE',
    args: [
      {
        title: 'FILE_PATH',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'RESPONSE',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'PACKET_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'ERROR_RESPONSE',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'PACKET_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'RELATED_ITEM',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'PACKET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ITEM_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'SCREEN',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'SCREEN_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'VIRTUAL',
    args: [],
  },
  {
    title: 'RESTRICTED',
    args: [],
  },
  {
    title: 'VALIDATOR',
    args: [
      {
        title: 'CLASS_FILENAME',
        options: ['""'],
        required: true,
      },
      {
        title: 'ARGUMENT',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'FORMAT_STRING',
    args: [
      {
        title: 'FORMAT',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'UNITS',
    args: [
      {
        title: 'FULL_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ABBREVIATED',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'DESCRIPTION',
    args: [
      {
        title: 'VALUE',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'META',
    args: [
      {
        title: 'META_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'META_VALUES',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'OVERLAP',
    args: [],
  },
  {
    title: 'KEY',
    args: [
      {
        title: 'KEY_STRING',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'VARIABLE_BIT_SIZE',
    args: [
      {
        title: 'LENGTH_ITEM_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'LENGTH_BITS_PER_COUNT',
        options: ['8'],
        required: false,
      },
      {
        title: 'LENGTH_VALUE_BIT_OFFSET',
        options: ['0'],
        required: false,
      },
    ],
  },
  {
    title: 'OBFUSCATE',
    args: [],
  },
  {
    title: 'REQUIRED',
    args: [],
  },
  {
    title: 'MINIMUM_VALUE',
    args: [
      {
        title: 'VALUE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'MAXIMUM_VALUE',
    args: [
      {
        title: 'VALUE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'DEFAULT_VALUE',
    args: [
      {
        title: 'VALUE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'STATE',
    args: [
      {
        title: 'KEY',
        options: [''],
        required: true,
      },
      {
        title: 'VALUE',
        options: [''],
        required: true,
      },
      {
        title: 'OPTIONS',
        options: ['HAZARDOUS', 'DISABLE_MESSAGES'],
        required: false,
      },
      {
        title: 'HAZARDOUS_DESCRIPTION',
        options: ['""'],
        required: false,
      },
    ],
  },
  {
    title: 'WRITE_CONVERSION',
    args: [
      {
        title: 'CLASS_FILENAME',
        options: ['""'],
        required: true,
      },
      {
        title: 'PARAMETER',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'POLY_WRITE_CONVERSION',
    args: [
      {
        title: 'C0',
        options: [''],
        required: true,
      },
      ...Array.from({ length: 10 }, () => {
        return { title: 'Cx', options: [''], required: false };
      }),
    ],
  },
  {
    title: 'SEG_POLY_WRITE_CONVERSION',
    args: [
      {
        title: 'LOWER_BOUND',
        options: [''],
        required: true,
      },
      {
        title: 'C0',
        options: [''],
        required: true,
      },
      ...Array.from({ length: 10 }, () => {
        return { title: 'Cx', options: [''], required: false };
      }),
    ],
  },
  {
    title: 'GENERIC_WRITE_CONVERSION_START',
    args: [],
  },
  {
    title: 'GENERIC_WRITE_CONVERSION_END',
    args: [],
  },
  {
    title: 'OVERFLOW',
    args: [
      {
        title: 'BEHAVIOR',
        options: ['ERROR', 'ERROR_ALLOW_HEX', 'TRUNCATE', 'SATURATE'],
        required: true,
      },
    ],
  },
];

export function createCmdCompletions(
  outputChannel: vscode.OutputChannel
): CosmosConfigurationCompletion {
  return new CosmosConfigurationCompletion(outputChannel, staticDefinitions, contextualDefinitions);
}
