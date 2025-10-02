import * as vscode from 'vscode';
import * as common from './cosmosCompletionTypes';
import { CosmosConfigurationCompletion } from './cosmosConfigurationCompletion';

const prebuiltPyInterfaces: string[] = [
  'openc3/interfaces/tcpip_client_interface.py',
  'openc3/interfaces/tcpip_server_interface.py',
  'openc3/interfaces/udp_interface.py',
  'openc3/interfaces/http_client_interface.py',
  'openc3/interfaces/http_server_interface.py',
  'openc3/interfaces/mqtt_interface.py',
  'openc3/interfaces/mqtt_stream_interface.py',
  'openc3/interfaces/serial_interface.py',
  'openc3/interfaces/file_interface.py',
];

const prebuiltRbInterfaces: string[] = [
  'tcpip_client_interface.rb',
  'tcpip_server_interface.rb',
  'udp_interface.rb',
  'http_client_interface.rb',
  'http_server_interface.rb',
  'mqtt_interface.rb',
  'mqtt_stream_interface.rb',
  'serial_interface.rb',
  'file_interface.rb',
  'snmp_interface.rb',
  'snmp_trap_interface.rb',
  'grpc_interface.rb',
];

const contextualDefinitions: common.ContextualDefinition[] = [
  {
    match: /^INTERFACE.*?/g,
    choices: [
      {
        condition: /.*?tcpip_client_interface.*?/g,
        title: 'TCPIP Interface Params',
        args: [
          {
            title: 'HOST',
            options: [''],
            required: true,
          },
          {
            title: 'WRITE_PORT',
            options: [''],
            required: true,
          },
          {
            title: 'READ_PORT',
            options: [''],
            required: true,
          },
          {
            title: 'WRITE_TIMEOUT_S',
            options: [''],
            required: true,
          },
          {
            title: 'READ_TIMEOUT_S',
            options: [''],
            required: true,
          },
          {
            title: 'PROTOCOL_TYPE',
            options: [''],
            required: false,
          },
          {
            title: 'PROTOCOL_ARGS',
            options: [''],
            required: false,
          },
        ],
      },
      // --- TCPIP SERVER INTERFACE ---
      {
        condition: /.*?tcpip_server_interface.*?/g,
        title: 'TCPIP Server Interface Params',
        args: [
          {
            title: 'WRITE_PORT',
            options: [''],
            required: true,
          },
          {
            title: 'READ_PORT',
            options: [''],
            required: true,
          },
          {
            title: 'WRITE_TIMEOUT_S',
            options: [''],
            required: true,
          },
          {
            title: 'READ_TIMEOUT_S',
            options: ['nil', 'None', ''], // Allows blocking or numeric timeout
            required: true,
          },
          {
            title: 'PROTOCOL_TYPE',
            options: [''],
            required: false,
          },
          {
            title: 'PROTOCOL_ARGS',
            options: [''],
            required: false,
          },
        ],
      },

      // --- UDP INTERFACE ---
      {
        condition: /.*?udp_interface.*?/g,
        title: 'UDP Interface Params',
        args: [
          {
            title: 'HOST',
            options: [''],
            required: true,
          },
          {
            title: 'WRITE_DEST_PORT',
            options: [''],
            required: true,
          },
          {
            title: 'READ_PORT',
            options: [''],
            required: true,
          },
          {
            title: 'WRITE_SOURCE_PORT',
            options: ['nil', 'None', ''],
            required: false,
          },
          {
            title: 'INTERFACE_ADDRESS',
            options: ['nil', 'None', ''], // For multicast
            required: false,
          },
          {
            title: 'TTL',
            options: [''],
            required: false,
          },
          {
            title: 'WRITE_TIMEOUT_S',
            options: [''],
            required: false,
          },
          {
            title: 'READ_TIMEOUT_S',
            options: ['nil', 'None', ''],
            required: false,
          },
        ],
      },

      // --- HTTP CLIENT INTERFACE ---
      {
        condition: /.*?http_client_interface.*?/g,
        title: 'HTTP Client Interface Params',
        args: [
          {
            title: 'HOST',
            options: [''],
            required: true,
          },
          {
            title: 'PORT',
            options: [''],
            required: false,
          },
          {
            title: 'PROTOCOL',
            options: ['HTTP', 'HTTPS'],
            required: false,
          },
          {
            title: 'WRITE_TIMEOUT_S',
            options: ['nil', 'None', ''],
            required: false,
          },
          {
            title: 'READ_TIMEOUT_S',
            options: ['nil', 'None', ''],
            required: false,
          },
          {
            title: 'CONNECT_TIMEOUT_S',
            options: [''],
            required: false,
          },
          {
            title: 'INCLUDE_REQUEST_IN_RESPONSE',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
        ],
      },

      // --- HTTP SERVER INTERFACE ---
      {
        condition: /.*?http_server_interface.*?/g,
        title: 'HTTP Server Interface Params',
        args: [
          {
            title: 'PORT',
            options: [''],
            required: false,
          },
        ],
      },

      // --- MQTT INTERFACE ---
      {
        condition: /.*?mqtt_interface.*?/g,
        title: 'MQTT Interface Params',
        args: [
          {
            title: 'HOST',
            options: [''],
            required: true,
          },
          {
            title: 'PORT',
            options: [''],
            required: false,
          },
          {
            title: 'SSL',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
        ],
      },

      // --- MQTT STREAMING INTERFACE ---
      {
        condition: /.*?mqtt_stream_interface.*?/g,
        title: 'MQTT Streaming Interface Params',
        args: [
          {
            title: 'HOST',
            options: [''],
            required: true,
          },
          {
            title: 'PORT',
            options: [''],
            required: false,
          },
          {
            title: 'SSL',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'WRITE_TOPIC',
            options: ['nil', 'None', ''],
            required: false,
          },
          {
            title: 'READ_TOPIC',
            options: ['nil', 'None', ''],
            required: false,
          },
          {
            title: 'PROTOCOL_TYPE',
            options: [''],
            required: false,
          },
          {
            title: 'PROTOCOL_ARGS',
            options: [''],
            required: false,
          },
        ],
      },

      // --- SERIAL INTERFACE ---
      {
        condition: /.*?serial_interface.*?/g,
        title: 'Serial Interface Params',
        args: [
          {
            title: 'WRITE_PORT',
            options: ['nil', 'None', ''],
            required: true,
          },
          {
            title: 'READ_PORT',
            options: ['nil', 'None', ''],
            required: true,
          },
          {
            title: 'BAUD_RATE',
            options: [''],
            required: true,
          },
          {
            title: 'PARITY',
            options: ['NONE', 'EVEN', 'ODD'],
            required: true,
          },
          {
            title: 'STOP_BITS',
            options: [''],
            required: true,
          },
          {
            title: 'WRITE_TIMEOUT_S',
            options: [''],
            required: true,
          },
          {
            title: 'READ_TIMEOUT_S',
            options: ['nil', 'None', ''],
            required: true,
          },
          {
            title: 'PROTOCOL_TYPE',
            options: [''],
            required: false,
          },
          {
            title: 'PROTOCOL_ARGS',
            options: [''],
            required: false,
          },
        ],
      },

      // --- FILE INTERFACE ---
      {
        condition: /.*?file_interface.*?/g,
        title: 'File Interface Params',
        args: [
          {
            title: 'COMMAND_WRITE_FOLDER',
            options: ['nil', 'None', ''],
            required: true,
          },
          {
            title: 'TELEMETRY_READ_FOLDER',
            options: ['nil', 'None', ''],
            required: true,
          },
          {
            title: 'TELEMETRY_ARCHIVE_FOLDER',
            options: ['DELETE', ''],
            required: true,
          },
          {
            title: 'FILE_READ_SIZE',
            options: [''],
            required: false,
          },
          {
            title: 'STORED',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'PROTOCOL_TYPE',
            options: [''],
            required: false,
          },
          {
            title: 'PROTOCOL_ARGS',
            options: [''],
            required: false,
          },
        ],
      },

      // --- SNMP INTERFACE (Ruby Only) ---
      {
        condition: /.*?snmp_interface.*?/g,
        title: 'SNMP Interface Params',
        args: [
          {
            title: 'HOST',
            options: [''],
            required: true,
          },
          {
            title: 'PORT',
            options: [''],
            required: false,
          },
        ],
      },

      // --- SNMP TRAP INTERFACE (Ruby Only) ---
      {
        condition: /.*?snmp_trap_interface.*?/g,
        title: 'SNMP Trap Interface Params',
        args: [
          {
            title: 'READ_PORT',
            options: [''],
            required: false,
          },
          {
            title: 'READ_TIMEOUT_S',
            options: ['nil', 'None', ''],
            required: false,
          },
          {
            title: 'BIND_ADDRESS',
            options: [''],
            required: true,
          },
        ],
      },

      // --- gRPC INTERFACE (Ruby Only) ---
      {
        condition: /.*?grpc_interface.*?/g,
        title: 'gRPC Interface Params',
        args: [
          {
            title: 'HOSTNAME',
            options: [''],
            required: true,
          },
          {
            title: 'PORT',
            options: [''],
            required: true,
          },
        ],
      },
    ],
  },
];

const staticDefinitions: common.CompletionDefinition[] = [
  // --- Interface ---
  {
    title: 'INTERFACE',
    args: [
      {
        title: 'INTERFACE_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'FILENAME',
        options: [...prebuiltPyInterfaces, ...prebuiltRbInterfaces],
        required: true,
      },
    ],
  },
  // --- Global Plugin Keywords ---
  {
    title: 'VARIABLE',
    args: [
      {
        title: 'VARIABLE_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'DEFAULT_VALUE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'NEEDS_DEPENDENCIES',
    args: [],
  },

  // --- Target Definition ---
  {
    title: 'TARGET',
    args: [
      {
        title: 'FOLDER_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'NAME',
        options: [''],
        required: true,
      },
    ],
  },

  // --- Target Modifiers ---
  {
    title: 'CMD_BUFFER_DEPTH',
    args: [
      {
        title: 'BUFFER_DEPTH',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CMD_LOG_CYCLE_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CMD_LOG_CYCLE_SIZE',
    args: [
      {
        title: 'SIZE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CMD_LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CMD_DECOM_LOG_CYCLE_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CMD_DECOM_LOG_CYCLE_SIZE',
    args: [
      {
        title: 'SIZE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CMD_DECOM_LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TLM_BUFFER_DEPTH',
    args: [
      {
        title: 'BUFFER_DEPTH',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TLM_LOG_CYCLE_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TLM_LOG_CYCLE_SIZE',
    args: [
      {
        title: 'SIZE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TLM_LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TLM_DECOM_LOG_CYCLE_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TLM_DECOM_LOG_CYCLE_SIZE',
    args: [
      {
        title: 'SIZE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TLM_DECOM_LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'REDUCED_MINUTE_LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'REDUCED_HOUR_LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'REDUCED_DAY_LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'REDUCED_LOG_RETAIN_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CLEANUP_POLL_TIME',
    args: [
      {
        title: 'TIME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'REDUCER_DISABLE',
    args: [],
  },
  {
    title: 'REDUCER_MAX_CPU_UTILIZATION',
    args: [
      {
        title: 'PERCENTAGE',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TARGET_MICROSERVICE',
    args: [
      {
        title: 'TYPE',
        options: [
          'DECOM',
          'COMMANDLOG',
          'DECOMCMDLOG',
          'PACKETLOG',
          'DECOMLOG',
          'REDUCER',
          'CLEANUP',
        ],
        required: true,
      },
    ],
  },
  {
    title: 'PACKET', // Modifier for TARGET_MICROSERVICE
    args: [
      {
        title: 'PACKET_NAME',
        options: [''], // Contextual: Should list telemetry packet names
        required: true,
      },
    ],
  },
  {
    title: 'DISABLE_ERB', // Applies to TARGET, MICROSERVICE, TOOL, WIDGET
    args: [
      {
        title: 'REGEX',
        options: [''],
        required: false, // Required if no arguments are passed to disable for everything
      },
    ],
  },
  {
    title: 'SHARD', // Applies to TARGET, MICROSERVICE (and others)
    args: [
      {
        title: 'SHARD_NUMBER',
        options: [''],
        required: false,
      },
    ],
  },

  // --- Microservice Definition ---
  {
    title: 'MICROSERVICE',
    args: [
      {
        title: 'MICROSERVICE_FOLDER_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'MICROSERVICE_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  // Microservice Modifiers
  {
    title: 'TOPIC',
    args: [
      {
        title: 'TOPIC_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'TARGET_NAME',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''], // Contextual: Should list target names
        required: true,
      },
    ],
  },
  {
    title: 'STOPPED',
    args: [],
  },

  // --- Shared Modifiers (Apply to Microservice, Tool, and others) ---
  {
    title: 'OPTION', // Applies to MICROSERVICE (and others)
    args: [
      {
        title: 'OPTION_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'OPTION_VALUE_S',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'SECRET', // Applies to MICROSERVICE (and others)
    args: [
      {
        title: 'TYPE',
        options: ['ENV', 'FILE'],
        required: true,
      },
      {
        title: 'SECRET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'ENVIRONMENT_VARIABLE_OR_FILE_PATH',
        options: [''],
        required: true,
      },
      {
        title: 'OPTION_NAME',
        options: [''],
        required: false,
      },
      {
        title: 'SECRET_STORE_NAME',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'ENV', // Applies to MICROSERVICE (and others)
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
    ],
  },
  {
    title: 'WORK_DIR', // Applies to MICROSERVICE (and others)
    args: [
      {
        title: 'DIRECTORY',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'PORT', // Applies to MICROSERVICE (and others)
    args: [
      {
        title: 'NUMBER',
        options: [''],
        required: true,
      },
      {
        title: 'PROTOCOL',
        options: ['TCP'],
        required: false,
      },
    ],
  },
  {
    title: 'CMD', // Applies to MICROSERVICE (and others)
    args: [
      {
        title: 'ARGS',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CONTAINER', // Applies to MICROSERVICE (and others)
    args: [
      {
        title: 'ARGS',
        options: [''],
        required: false,
      },
    ],
  },
  {
    title: 'ROUTE_PREFIX', // Applies to MICROSERVICE (and others)
    args: [
      {
        title: 'ROUTE_PREFIX',
        options: [''],
        required: true,
      },
    ],
  },

  // --- Tool Definition ---
  {
    title: 'TOOL',
    args: [
      {
        title: 'TOOL_FOLDER_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'TOOL_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  // Tool Modifiers
  {
    title: 'URL',
    args: [
      {
        title: 'URL',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'INLINE_URL',
    args: [
      {
        title: 'URL',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'WINDOW',
    args: [
      {
        title: 'WINDOW_MODE',
        options: ['INLINE', 'IFRAME', 'NEW'],
        required: true,
      },
    ],
  },
  {
    title: 'ICON',
    args: [
      {
        title: 'ICON_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'CATEGORY',
    args: [
      {
        title: 'CATEGORY_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'SHOWN',
    args: [
      {
        title: 'SHOWN',
        options: ['true', 'false'],
        required: true,
      },
    ],
  },
  {
    title: 'POSITION',
    args: [
      {
        title: 'POSITION',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'IMPORT_MAP_ITEM',
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
    ],
  },
  // Note: TOOL shares DISABLE_ERB.

  // --- Widget Definition ---
  {
    title: 'WIDGET',
    args: [
      {
        title: 'WIDGET_NAME',
        options: [''],
        required: true,
      },
      {
        title: 'LABEL',
        options: [''],
        required: false,
      },
    ],
  },
  // Note: WIDGET shares DISABLE_ERB.

  // --- Script Engine Definition ---
  {
    title: 'SCRIPT_ENGINE',
    args: [
      {
        title: 'EXTENSION',
        options: [''],
        required: true,
      },
      {
        title: 'SCRIPT_ENGINE_FILENAME',
        options: [''],
        required: true,
      },
    ],
  },
];

export function createPluginCompletions(
  outputChannel: vscode.OutputChannel
): CosmosConfigurationCompletion {
  return new CosmosConfigurationCompletion(outputChannel, staticDefinitions, contextualDefinitions);
}
