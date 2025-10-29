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

const contextualCmdDefinitions: common.ContextualDefinition[] = [
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

const cmdStaticDefinitions: common.CompletionDefinition[] = [
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

const tlmStaticDefinitions: common.CompletionDefinition[] = [
  {
    title: 'TELEMETRY',
    args: [
      {
        title: 'TARGET',
        options: ['<%= target_name %>'],
        required: true,
      },
      {
        title: 'MNEMONIC', // Referred to as Mnemonic/Packet Name in docs
        options: [''],
        required: true,
      },
      {
        title: 'ENDIANNESS',
        options: common.endianOpts, // BIG_ENDIAN, LITTLE_ENDIAN
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
    title: 'SELECT_TELEMETRY',
    args: [
      {
        title: 'TARGET_NAME',
        options: ['<%= target_name %>'],
        required: true,
      },
      {
        title: 'PACKET_NAME',
        options: [''],
        required: true,
      },
    ],
  },

  // --- Item Definitions (Modifiers of TELEMETRY/SELECT_TELEMETRY) ---
  {
    title: 'ITEM',
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
        title: 'BIT_SIZE',
        options: common.frequentlyUsedBitSize,
        required: true,
      },
      {
        title: 'DATA_TYPE',
        options: common.typeConstants, // INT, UINT, FLOAT, STRING, BLOCK, DERIVED
        required: true,
      },
      ...descAndEndian, // DESCRIPTION, ENDIANNESS (Optional)
    ],
  },
  {
    title: 'ID_ITEM',
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
        title: 'BIT_SIZE',
        options: common.frequentlyUsedBitSize,
        required: true,
      },
      {
        title: 'DATA_TYPE',
        options: common.typeConstantsWithoutDerived, // INT, UINT, FLOAT, STRING, BLOCK
        required: true,
      },
      {
        title: 'ID_VALUE',
        options: [''],
        required: true,
      },
      ...descAndEndian, // DESCRIPTION, ENDIANNESS (Optional)
    ],
  },
  {
    title: 'APPEND_ITEM',
    args: [
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
        options: common.typeConstants, // INT, UINT, FLOAT, STRING, BLOCK, DERIVED
        required: true,
      },
      ...descAndEndian, // DESCRIPTION, ENDIANNESS (Optional)
    ],
  },
  {
    title: 'APPEND_ID_ITEM',
    args: [
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
        options: common.typeConstantsWithoutDerived, // INT, UINT, FLOAT, STRING, BLOCK
        required: true,
      },
      {
        title: 'ID_VALUE',
        options: [''],
        required: true,
      },
      ...descAndEndian, // DESCRIPTION, ENDIANNESS (Optional)
    ],
  },

  // --- Array Item Definitions ---
  {
    title: 'ARRAY_ITEM',
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
        options: common.typeConstants, // INT, UINT, FLOAT, STRING, BLOCK, DERIVED
        required: true,
      },
      {
        title: 'ARRAY_BIT_SIZE',
        options: [''],
        required: true,
      },
      ...descAndEndian, // DESCRIPTION, ENDIANNESS (Optional)
    ],
  },
  {
    title: 'APPEND_ARRAY_ITEM',
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
        options: common.typeConstants, // INT, UINT, FLOAT, STRING, BLOCK, DERIVED
        required: true,
      },
      {
        title: 'ARRAY_BIT_SIZE',
        options: [''],
        required: true,
      },
      ...descAndEndian, // DESCRIPTION, ENDIANNESS (Optional)
    ],
  },

  // --- Item Selection/Manipulation ---
  {
    title: 'SELECT_ITEM',
    args: [
      {
        title: 'ITEM',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'DELETE_ITEM',
    args: [
      {
        title: 'ITEM',
        options: [''],
        required: true,
      },
    ],
  },

  // --- Packet/Item Modifiers (Can apply to TELEMETRY or ITEM, depending on context) ---
  // NOTE: Assuming META is a packet modifier when defined alone, and an item modifier when inside an ITEM definition.
  {
    title: 'META', // Packet or Item Modifier
    args: [
      {
        title: 'META_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'META_VALUES',
        options: [''],
        required: false,
      },
    ],
  },

  // --- Packet Modifiers (Must follow TELEMETRY/SELECT_TELEMETRY) ---
  {
    title: 'PROCESSOR',
    args: [
      {
        title: 'PROCESSOR_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'PROCESSOR_CLASS_FILENAME',
        options: [''],
        required: true,
      },
      {
        title: 'PROCESSOR_SPECIFIC_OPTIONS',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'ALLOW_SHORT',
    args: [], // No parameters
  },
  {
    title: 'HIDDEN',
    args: [], // No parameters
  },
  {
    title: 'ACCESSOR',
    args: [
      {
        title: 'ACCESSOR_CLASS_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TEMPLATE',
    args: [
      {
        title: 'TEMPLATE_STRING',
        options: ['""'],
        required: true,
      },
    ],
  },
  {
    title: 'TEMPLATE_FILE',
    args: [
      {
        title: 'TEMPLATE_FILE_PATH',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'IGNORE_OVERLAP',
    args: [], // No parameters
  },
  {
    title: 'VIRTUAL',
    args: [], // No parameters
  },

  // --- Item Modifiers (Must follow ITEM/APPEND_ITEM/etc.) ---
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
    title: 'OVERLAP',
    args: [], // No parameters
  },
  {
    title: 'KEY',
    args: [
      {
        title: 'KEY_STRING',
        options: [''],
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
        options: [''],
        required: false,
      },
      {
        title: 'LENGTH_VALUE_BIT_OFFSET',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'OBFUSCATE',
    args: [], // No parameters
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
        title: 'COLOR',
        options: ['GREEN', 'YELLOW', 'RED'],
        required: false,
      },
    ],
  },
  {
    title: 'READ_CONVERSION',
    args: [
      {
        title: 'CLASS_FILENAME',
        options: [''],
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
    title: 'POLY_READ_CONVERSION',
    args: [], // Parameters not specified in the provided text, typically coefficients
  },
  {
    title: 'SEG_POLY_READ_CONVERSION',
    args: [], // Parameters not specified in the provided text
  },
  {
    title: 'GENERIC_READ_CONVERSION_START',
    args: [
      {
        title: 'CONVERTED_TYPE',
        options: common.typeConstantsWithoutDerived, // INT, UINT, FLOAT, STRING
        required: false,
      },
      {
        title: 'CONVERTED_BIT_SIZE',
        options: common.frequentlyUsedBitSize,
        required: false,
      },
    ],
  },
  {
    title: 'GENERIC_READ_CONVERSION_END',
    args: [], // No parameters
  },
  {
    title: 'LIMITS',
    args: [
      {
        title: 'LIMITS_SET',
        options: ['DEFAULT'],
        required: true,
      },
      {
        title: 'PERSISTENCE',
        options: [''],
        required: true,
      },
      {
        title: 'INITIAL_STATE',
        options: ['ENABLED', 'DISABLED'],
        required: true,
      },
      {
        title: 'RED_LOW_LIMIT',
        options: [''],
        required: true,
      },
      {
        title: 'YELLOW_LOW_LIMIT',
        options: [''],
        required: true,
      },
      {
        title: 'YELLOW_HIGH_LIMIT',
        options: [''],
        required: true,
      },
      {
        title: 'RED_HIGH_LIMIT',
        options: [''],
        required: true,
      },
      {
        title: 'GREEN_LOW_LIMIT',
        options: [''],
        required: false,
      },
      {
        title: 'GREEN_HIGH_LIMIT',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'LIMITS_RESPONSE',
    args: [
      {
        title: 'RESPONSE_CLASS_FILENAME',
        options: [''],
        required: true,
      },
      {
        title: 'RESPONSE_SPECIFIC_OPTIONS',
        options: [''],
        required: false,
      },
    ],
  },

  // --- Limits Group Modifiers (Global/Top-level) ---
  {
    title: 'LIMITS_GROUP',
    args: [
      {
        title: 'GROUP_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'LIMITS_GROUP_ITEM',
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
];

export function createCmdTlmCompletions(
  outputChannel: vscode.OutputChannel
): CosmosConfigurationCompletion {
  const staticDefinitions = [...cmdStaticDefinitions, ...tlmStaticDefinitions];

  return new CosmosConfigurationCompletion(
    outputChannel,
    staticDefinitions,
    contextualCmdDefinitions,
    'cmd/tlm completion provider'
  );
}
