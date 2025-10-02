import * as vscode from 'vscode';
import * as common from './cosmosCompletionTypes';
import { CosmosConfigurationCompletion } from './cosmosConfigurationCompletion';

const prebuiltPyProtocols: string[] = [
  'openc3/interfaces/protocols/cobs_protocol.py',
  'openc3/interfaces/protocols/slip_protocol.py',
  'openc3/interfaces/protocols/burst_protocol.py',
  'openc3/interfaces/protocols/fixed_protocol.py',
  'openc3/interfaces/protocols/length_protocol.py',
  'openc3/interfaces/protocols/terminated_protocol.py',
  'openc3/interfaces/protocols/preidentified_protocol.py',
  'openc3/interfaces/protocols/cmd_response_protocol.py',
];

const prebuiltRbProtocols: string[] = [
  'CobsProtocol',
  'SlipProtocol',
  'BurstProtocol',
  'FixedProtocol',
  'LengthProtocol',
  'TerminatedProtocol',
  'GemsProtocol',
  'CcsdsCltuProtocol',
  'CcsdsTctfProtocol',
  'CcsdsTmtfProtocol',
  'PreidentifiedProtocol',
  'CmdResponseProtocol',
];

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
            options: ['nil', 'None'], // Allows blocking or numeric timeout
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
            options: ['nil', 'None'],
            required: false,
          },
          {
            title: 'INTERFACE_ADDRESS',
            options: ['nil', 'None'], // For multicast
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
            options: ['nil', 'None'],
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
            options: ['nil', 'None'],
            required: false,
          },
          {
            title: 'READ_TIMEOUT_S',
            options: ['nil', 'None'],
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
            options: ['nil', 'None'],
            required: false,
          },
          {
            title: 'READ_TOPIC',
            options: ['nil', 'None'],
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
            options: ['nil', 'None'],
            required: true,
          },
          {
            title: 'READ_PORT',
            options: ['nil', 'None'],
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
            options: ['nil', 'None'],
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
            options: ['nil', 'None'],
            required: true,
          },
          {
            title: 'TELEMETRY_READ_FOLDER',
            options: ['nil', 'None'],
            required: true,
          },
          {
            title: 'TELEMETRY_ARCHIVE_FOLDER',
            options: ['DELETE'],
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
            options: ['nil', 'None'],
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
  {
    match: /^PROTOCOL\s+(READ|WRITE|READ_WRITE)\s+(.*?)\s*/i,
    choices: [
      {
        condition: /.*?(?:CobsProtocol|cobs_protocol).*?/,
        title: 'COBS_PROTOCOL',
        args: [
          // COBS takes no required parameters
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'], // End users rarely specify this
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:SlipProtocol|slip_protocol).*?/,
        title: 'SLIP_PROTOCOL',
        args: [
          {
            title: 'START_CHAR',
            options: ['nil'],
            required: false,
          },
          {
            title: 'READ_STRIP_CHARACTERS',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'READ_ENABLE_ESCAPING',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'WRITE_ENABLE_ESCAPING',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'END_CHAR',
            options: ['0xC0'],
            required: false,
          },
          {
            title: 'ESC_CHAR',
            options: ['0xDB'],
            required: false,
          },
          {
            title: 'ESCAPE_END_CHAR',
            options: ['0xDC'],
            required: false,
          },
          {
            title: 'ESCAPE_ESC_CHAR',
            options: ['0xDD'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:BurstProtocol|burst_protocol).*?/,
        title: 'BURST_PROTOCOL',
        args: [
          {
            title: 'DISCARD_LEADING_BYTES',
            options: [''],
            required: false,
          },
          {
            title: 'SYNC_PATTERN',
            options: ['nil'],
            required: false,
          },
          {
            title: 'FILL_FIELDS',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:FixedProtocol|fixed_protocol).*?/,
        title: 'FIXED_PROTOCOL',
        args: [
          {
            title: 'MINIMUM_ID_SIZE',
            options: [''],
            required: true,
          },
          {
            title: 'DISCARD_LEADING_BYTES',
            options: [''],
            required: false,
          },
          {
            title: 'SYNC_PATTERN',
            options: ['nil'],
            required: false,
          },
          {
            title: 'TELEMETRY',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'FILL_FIELDS',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'UNKNOWN_RAISE',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:LengthProtocol|length_protocol).*?/,
        title: 'LENGTH_PROTOCOL',
        args: [
          {
            title: 'LENGTH_BIT_OFFSET',
            options: [''],
            required: false,
          },
          {
            title: 'LENGTH_BIT_SIZE',
            options: [''],
            required: false,
          },
          {
            title: 'LENGTH_VALUE_OFFSET',
            options: [''],
            required: false,
          },
          {
            title: 'BYTES_PER_COUNT',
            options: [''],
            required: false,
          },
          {
            title: 'LENGTH_ENDIANNESS',
            options: ['BIG_ENDIAN', 'LITTLE_ENDIAN'],
            required: false,
          },
          {
            title: 'DISCARD_LEADING_BYTES',
            options: [''],
            required: false,
          },
          {
            title: 'SYNC_PATTERN',
            options: ['nil'],
            required: false,
          },
          {
            title: 'MAX_LENGTH',
            options: ['nil'],
            required: false,
          },
          {
            title: 'FILL_LENGTH_AND_SYNC_PATTERN',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:TerminatedProtocol|terminated_protocol).*?/,
        title: 'TERMINATED_PROTOCOL',
        args: [
          {
            title: 'WRITE_TERMINATION_CHARACTERS',
            options: [''],
            required: true,
          },
          {
            title: 'READ_TERMINATION_CHARACTERS',
            options: [''],
            required: true,
          },
          {
            title: 'STRIP_READ_TERMINATION',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'DISCARD_LEADING_BYTES',
            options: [''],
            required: false,
          },
          {
            title: 'SYNC_PATTERN',
            options: ['nil'],
            required: false,
          },
          {
            title: 'FILL_FIELDS',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:GemsProtocol|gems_protocol).*?/,
        title: 'GEMS_PROTOCOL',
        args: [
          // GEMS takes no required parameters
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:CcsdsCltuProtocol|ccsds_cltu_protocol).*?/,
        title: 'CCSDS_CLTU_PROTOCOL',
        args: [
          {
            title: 'HEADER',
            options: ['0xEB90'],
            required: false,
          },
          {
            title: 'FOOTER',
            options: ['0xC5C5C5C5C5C5C579'],
            required: false,
          },
          {
            title: 'FILL_BYTE',
            options: ['0x55'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:CcsdsTctfProtocol|ccsds_tctf_protocol).*?/,
        title: 'CCSDS_TCTF_PROTOCOL',
        args: [
          {
            title: 'RANDOMIZATION',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ERROR_CONTROL',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'BYPASS',
            options: [''],
            required: false,
          },
          {
            title: 'SCID',
            options: [''],
            required: false,
          },
          {
            title: 'VCID',
            options: [''],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:CcsdsTmtfProtocol|ccsds_tmtf_protocol).*?/,
        title: 'CCSDS_TMTF_PROTOCOL',
        args: [
          {
            title: 'SCID',
            options: [''],
            required: true,
          },
          {
            title: 'FRAME_LENGTH',
            options: [''],
            required: false,
          },
          {
            title: 'RANDOMIZATION',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'DISCARD_LEADING_BYTES',
            options: [''],
            required: false,
          },
          {
            title: 'SYNC_PATTERN',
            options: ['nil'],
            required: false,
          },
          {
            title: 'FILL_FIELDS',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:TemplateProtocol|template_protocol).*?/,
        title: 'TEMPLATE_PROTOCOL_DEPRECATED',
        args: [
          {
            title: 'WRITE_TERMINATION_CHARACTERS',
            options: [''],
            required: true,
          },
          {
            title: 'READ_TERMINATION_CHARACTERS',
            options: [''],
            required: true,
          },
          {
            title: 'IGNORE_LINES',
            options: [''],
            required: false,
          },
          {
            title: 'INITIAL_READ_DELAY',
            options: ['nil'],
            required: false,
          },
          {
            title: 'RESPONSE_LINES',
            options: [''],
            required: false,
          },
          {
            title: 'STRIP_READ_TERMINATION',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'DISCARD_LEADING_BYTES',
            options: [''],
            required: false,
          },
          {
            title: 'SYNC_PATTERN',
            options: ['nil'],
            required: false,
          },
          {
            title: 'FILL_FIELDS',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'RESPONSE_TIMEOUT',
            options: [''],
            required: false,
          },
          {
            title: 'RESPONSE_POLLING_PERIOD',
            options: [''],
            required: false,
          },
          {
            title: 'RAISE_EXCEPTIONS',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:PreidentifiedProtocol|preidentified_protocol).*?/,
        title: 'PREIDENTIFIED_PROTOCOL',
        args: [
          {
            title: 'SYNC_PATTERN',
            options: ['nil'],
            required: false,
          },
          {
            title: 'MAX_LENGTH',
            options: ['nil'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:CmdResponseProtocol|cmd_response_protocol).*?/,
        title: 'CMD_RESPONSE_PROTOCOL',
        args: [
          {
            title: 'RESPONSE_TIMEOUT',
            options: [''],
            required: false,
          },
          {
            title: 'RESPONSE_POLLING_PERIOD',
            options: [''],
            required: false,
          },
          {
            title: 'RAISE_EXCEPTIONS',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:CrcProtocol|crc_protocol).*?/,
        title: 'CRC_PROTOCOL',
        args: [
          {
            title: 'WRITE_ITEM_NAME',
            options: ['nil'],
            required: false,
          },
          {
            title: 'STRIP_CRC',
            options: ['true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'BAD_STRATEGY',
            options: ['ERROR', 'DISCONNECT'],
            required: false,
          },
          {
            title: 'BIT_OFFSET',
            options: [''],
            required: false,
          },
          {
            title: 'BIT_SIZE',
            options: ['16', '32', '64'],
            required: false,
          },
          {
            title: 'ENDIANNESS',
            options: ['BIG_ENDIAN', 'LITTLE_ENDIAN'],
            required: false,
          },
          // Note: POLY, SEED, XOR, REFLECT must be provided together or all omitted
          {
            title: 'POLY',
            options: ['nil'],
            required: false,
          },
          {
            title: 'SEED',
            options: ['nil'],
            required: false,
          },
          {
            title: 'XOR',
            options: ['nil', 'true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'REFLECT',
            options: ['nil', 'true', 'false', 'True', 'False'],
            required: false,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
      {
        condition: /.*?(?:IgnorePacketProtocol|ignore_packet_protocol).*?/,
        title: 'IGNORE_PACKET_PROTOCOL',
        args: [
          {
            title: 'TARGET_NAME',
            options: ['nil'], // Contextual: Target names
            required: true,
          },
          {
            title: 'PACKET_NAME',
            options: ['nil'], // Contextual: Packet names for the given target
            required: true,
          },
          {
            title: 'ALLOW_EMPTY_DATA',
            options: ['true', 'false', 'nil'],
            required: false,
          },
        ],
      },
    ],
  },
  {
    match: /^OPTION.*?/,
    choices: [
      {
        condition: /.*?CONNECT_CMD.*?/,
        title: 'CMD',
        args: [
          {
            title: 'LOGGING',
            options: ['LOG', 'DONT_LOG'],
            required: true,
          },
          {
            title: 'COMMAND',
            options: ['""'],
            required: true,
          },
        ],
      },
      {
        condition: /.*?PERIODIC_CMD.*?/,
        title: 'CMD',
        args: [
          {
            title: 'LOGGING',
            options: ['LOG', 'DONT_LOG'],
            required: true,
          },
          {
            title: 'PERIOD',
            options: ['1.0'],
            required: true,
          },
          {
            title: 'COMMAND',
            options: ['""'],
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
  // --- Protocol ---
  {
    title: 'PROTOCOL',
    args: [
      {
        title: 'DIRECTION/TYPE',
        options: ['READ', 'WRITE', 'READ_WRITE'],
        required: true,
      },
      {
        title: 'PROTOCOL_FILENAME/CLASSNAME',
        options: [...prebuiltPyProtocols, ...prebuiltRbProtocols],
        required: true,
      },
    ],
  },
  {
    title: 'MAP_TARGET',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'MAP_CMD_TARGET',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
        required: true,
      },
    ],
  },
  {
    title: 'MAP_TLM_TARGET',
    args: [
      {
        title: 'TARGET_NAME',
        options: [''],
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
        title: 'TARGET_NAME',
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
        options: [
          'SYNC_PACKET_COUNT_DELAY_SECONDS',
          'OPTIMIZE_THROUGHPUT',
          'PERIODIC_CMD',
          'CONNECT_CMD',
        ],
        required: true,
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
