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

const staticDefinitions: common.CompletionDefinition[] = [
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

export function createTlmCompletions(
  outputChannel: vscode.OutputChannel
): CosmosConfigurationCompletion {
  return new CosmosConfigurationCompletion(outputChannel, staticDefinitions, []);
}
