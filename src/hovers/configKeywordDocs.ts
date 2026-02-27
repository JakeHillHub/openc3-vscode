export interface KeywordDoc {
  syntax: string;
  summary: string;
  parameters?: { name: string; description: string; required: boolean; values?: string[] }[];
}

// ─── Command / Telemetry keyword docs ───────────────────────────────────────

export const cmdTlmKeywordDocs: Record<string, KeywordDoc> = {
  // ── Command Packet ──
  COMMAND: {
    syntax: 'COMMAND <target> <command_name> <endianness> [description]',
    summary: 'Defines a new command packet.',
    parameters: [
      { name: 'target', description: 'Target name', required: true },
      { name: 'command_name', description: 'Command name', required: true },
      { name: 'endianness', description: 'Byte order of the command', required: true, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
      { name: 'description', description: 'Description of the command in quotes', required: false },
    ],
  },
  SELECT_COMMAND: {
    syntax: 'SELECT_COMMAND <target> <command_name>',
    summary: 'Selects an existing command packet for modification.',
    parameters: [
      { name: 'target', description: 'Target name', required: true },
      { name: 'command_name', description: 'Name of the existing command to select', required: true },
    ],
  },

  // ── Command Parameters ──
  PARAMETER: {
    syntax: 'PARAMETER <name> <bit_offset> <bit_size> <data_type> ...',
    summary: 'Defines a command parameter at a specific bit offset.',
    parameters: [
      { name: 'name', description: 'Unique parameter name', required: true },
      { name: 'bit_offset', description: 'Bit offset from the start of the packet', required: true },
      { name: 'bit_size', description: 'Number of bits', required: true },
      { name: 'data_type', description: 'Data type', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK', 'DERIVED'] },
    ],
  },
  APPEND_PARAMETER: {
    syntax: 'APPEND_PARAMETER <name> <bit_size> <data_type> ...',
    summary: 'Defines a command parameter appended to the current packet position.',
    parameters: [
      { name: 'name', description: 'Unique parameter name', required: true },
      { name: 'bit_size', description: 'Number of bits', required: true },
      { name: 'data_type', description: 'Data type', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK', 'DERIVED'] },
    ],
  },
  ID_PARAMETER: {
    syntax: 'ID_PARAMETER <name> <bit_offset> <bit_size> <data_type> ...',
    summary: 'Defines an identification command parameter at a specific bit offset. ID parameters are used to uniquely identify a command.',
    parameters: [
      { name: 'name', description: 'Unique parameter name', required: true },
      { name: 'bit_offset', description: 'Bit offset from the start of the packet', required: true },
      { name: 'bit_size', description: 'Number of bits', required: true },
      { name: 'data_type', description: 'Data type', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK'] },
    ],
  },
  APPEND_ID_PARAMETER: {
    syntax: 'APPEND_ID_PARAMETER <name> <bit_size> <data_type> ...',
    summary: 'Defines an identification command parameter appended to the current packet position.',
    parameters: [
      { name: 'name', description: 'Unique parameter name', required: true },
      { name: 'bit_size', description: 'Number of bits', required: true },
      { name: 'data_type', description: 'Data type', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK'] },
    ],
  },
  ARRAY_PARAMETER: {
    syntax: 'ARRAY_PARAMETER <name> <bit_offset> <item_bit_size> <item_data_type> <array_bit_size> [description] [endianness]',
    summary: 'Defines an array command parameter at a specific bit offset.',
    parameters: [
      { name: 'name', description: 'Unique parameter name', required: true },
      { name: 'bit_offset', description: 'Bit offset from the start of the packet', required: true },
      { name: 'item_bit_size', description: 'Bit size of each array element', required: true },
      { name: 'item_data_type', description: 'Data type of each array element', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK', 'DERIVED'] },
      { name: 'array_bit_size', description: 'Total bit size of the array', required: true },
      { name: 'description', description: 'Description in quotes', required: false },
      { name: 'endianness', description: 'Override packet endianness', required: false, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
    ],
  },
  APPEND_ARRAY_PARAMETER: {
    syntax: 'APPEND_ARRAY_PARAMETER <name> <item_bit_size> <item_data_type> <array_bit_size> [description] [endianness]',
    summary: 'Defines an array command parameter appended to the current packet position.',
    parameters: [
      { name: 'name', description: 'Unique parameter name', required: true },
      { name: 'item_bit_size', description: 'Bit size of each array element', required: true },
      { name: 'item_data_type', description: 'Data type of each array element', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK', 'DERIVED'] },
      { name: 'array_bit_size', description: 'Total bit size of the array', required: true },
      { name: 'description', description: 'Description in quotes', required: false },
      { name: 'endianness', description: 'Override packet endianness', required: false, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
    ],
  },
  SELECT_PARAMETER: {
    syntax: 'SELECT_PARAMETER <parameter_name>',
    summary: 'Selects an existing command parameter for modification.',
    parameters: [
      { name: 'parameter_name', description: 'Name of the existing parameter to select', required: true },
    ],
  },
  DELETE_PARAMETER: {
    syntax: 'DELETE_PARAMETER <parameter_name>',
    summary: 'Deletes an existing command parameter from the packet definition.',
    parameters: [
      { name: 'parameter_name', description: 'Name of the parameter to delete', required: true },
    ],
  },

  // ── Telemetry Packet ──
  TELEMETRY: {
    syntax: 'TELEMETRY <target> <packet_name> <endianness> [description]',
    summary: 'Defines a new telemetry packet.',
    parameters: [
      { name: 'target', description: 'Target name', required: true },
      { name: 'packet_name', description: 'Telemetry packet name', required: true },
      { name: 'endianness', description: 'Byte order of the telemetry packet', required: true, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
      { name: 'description', description: 'Description of the packet in quotes', required: false },
    ],
  },
  SELECT_TELEMETRY: {
    syntax: 'SELECT_TELEMETRY <target> <packet_name>',
    summary: 'Selects an existing telemetry packet for modification.',
    parameters: [
      { name: 'target', description: 'Target name', required: true },
      { name: 'packet_name', description: 'Name of the existing telemetry packet to select', required: true },
    ],
  },

  // ── Telemetry Items ──
  ITEM: {
    syntax: 'ITEM <name> <bit_offset> <bit_size> <data_type> [description] [endianness]',
    summary: 'Defines a telemetry item at a specific bit offset.',
    parameters: [
      { name: 'name', description: 'Unique item name', required: true },
      { name: 'bit_offset', description: 'Bit offset from the start of the packet', required: true },
      { name: 'bit_size', description: 'Number of bits', required: true },
      { name: 'data_type', description: 'Data type', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK', 'DERIVED'] },
      { name: 'description', description: 'Description in quotes', required: false },
      { name: 'endianness', description: 'Override packet endianness', required: false, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
    ],
  },
  APPEND_ITEM: {
    syntax: 'APPEND_ITEM <name> <bit_size> <data_type> [description] [endianness]',
    summary: 'Defines a telemetry item appended to the current packet position.',
    parameters: [
      { name: 'name', description: 'Unique item name', required: true },
      { name: 'bit_size', description: 'Number of bits', required: true },
      { name: 'data_type', description: 'Data type', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK', 'DERIVED'] },
      { name: 'description', description: 'Description in quotes', required: false },
      { name: 'endianness', description: 'Override packet endianness', required: false, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
    ],
  },
  ID_ITEM: {
    syntax: 'ID_ITEM <name> <bit_offset> <bit_size> <data_type> <id_value> [description] [endianness]',
    summary: 'Defines an identification telemetry item at a specific bit offset. ID items are used to uniquely identify a telemetry packet.',
    parameters: [
      { name: 'name', description: 'Unique item name', required: true },
      { name: 'bit_offset', description: 'Bit offset from the start of the packet', required: true },
      { name: 'bit_size', description: 'Number of bits', required: true },
      { name: 'data_type', description: 'Data type', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK'] },
      { name: 'id_value', description: 'Expected identification value', required: true },
      { name: 'description', description: 'Description in quotes', required: false },
      { name: 'endianness', description: 'Override packet endianness', required: false, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
    ],
  },
  APPEND_ID_ITEM: {
    syntax: 'APPEND_ID_ITEM <name> <bit_size> <data_type> <id_value> [description] [endianness]',
    summary: 'Defines an identification telemetry item appended to the current packet position.',
    parameters: [
      { name: 'name', description: 'Unique item name', required: true },
      { name: 'bit_size', description: 'Number of bits', required: true },
      { name: 'data_type', description: 'Data type', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK'] },
      { name: 'id_value', description: 'Expected identification value', required: true },
      { name: 'description', description: 'Description in quotes', required: false },
      { name: 'endianness', description: 'Override packet endianness', required: false, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
    ],
  },
  ARRAY_ITEM: {
    syntax: 'ARRAY_ITEM <name> <bit_offset> <item_bit_size> <item_data_type> <array_bit_size> [description] [endianness]',
    summary: 'Defines an array telemetry item at a specific bit offset.',
    parameters: [
      { name: 'name', description: 'Unique item name', required: true },
      { name: 'bit_offset', description: 'Bit offset from the start of the packet', required: true },
      { name: 'item_bit_size', description: 'Bit size of each array element', required: true },
      { name: 'item_data_type', description: 'Data type of each array element', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK', 'DERIVED'] },
      { name: 'array_bit_size', description: 'Total bit size of the array', required: true },
      { name: 'description', description: 'Description in quotes', required: false },
      { name: 'endianness', description: 'Override packet endianness', required: false, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
    ],
  },
  APPEND_ARRAY_ITEM: {
    syntax: 'APPEND_ARRAY_ITEM <name> <item_bit_size> <item_data_type> <array_bit_size> [description] [endianness]',
    summary: 'Defines an array telemetry item appended to the current packet position.',
    parameters: [
      { name: 'name', description: 'Unique item name', required: true },
      { name: 'item_bit_size', description: 'Bit size of each array element', required: true },
      { name: 'item_data_type', description: 'Data type of each array element', required: true, values: ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK', 'DERIVED'] },
      { name: 'array_bit_size', description: 'Total bit size of the array', required: true },
      { name: 'description', description: 'Description in quotes', required: false },
      { name: 'endianness', description: 'Override packet endianness', required: false, values: ['BIG_ENDIAN', 'LITTLE_ENDIAN'] },
    ],
  },
  SELECT_ITEM: {
    syntax: 'SELECT_ITEM <item_name>',
    summary: 'Selects an existing telemetry item for modification.',
    parameters: [
      { name: 'item_name', description: 'Name of the existing item to select', required: true },
    ],
  },
  DELETE_ITEM: {
    syntax: 'DELETE_ITEM <item_name>',
    summary: 'Deletes an existing telemetry item from the packet definition.',
    parameters: [
      { name: 'item_name', description: 'Name of the item to delete', required: true },
    ],
  },

  // ── Packet Modifiers ──
  HIDDEN: {
    syntax: 'HIDDEN',
    summary: 'Hides the command or telemetry packet from the user interface.',
  },
  DISABLED: {
    syntax: 'DISABLED',
    summary: 'Disables the command. Hidden from the user and cannot be sent.',
  },
  DISABLE_MESSAGES: {
    syntax: 'DISABLE_MESSAGES',
    summary: 'Disables success/warning messages when the command is sent.',
  },
  META: {
    syntax: 'META <meta_name> [meta_values...]',
    summary: 'Stores metadata key-value pair for the current packet or item.',
    parameters: [
      { name: 'meta_name', description: 'Name of the metadata', required: true },
      { name: 'meta_values', description: 'One or more metadata values', required: false },
    ],
  },
  HAZARDOUS: {
    syntax: 'HAZARDOUS [description]',
    summary: 'Marks the command as hazardous. Users will be prompted to confirm before sending.',
    parameters: [
      { name: 'description', description: 'Description of why the command is hazardous', required: false },
    ],
  },
  ACCESSOR: {
    syntax: 'ACCESSOR <accessor_class_name> [args...]',
    summary: 'Defines the accessor class used to read and write raw packet data.',
    parameters: [
      { name: 'accessor_class_name', description: 'Name of the accessor class', required: true },
      { name: 'args', description: 'Additional arguments for the accessor', required: false },
    ],
  },
  TEMPLATE: {
    syntax: 'TEMPLATE <template_string>',
    summary: 'Defines a template string for the packet. Used with template-based protocols.',
    parameters: [
      { name: 'template_string', description: 'Template string in quotes', required: true },
    ],
  },
  TEMPLATE_FILE: {
    syntax: 'TEMPLATE_FILE <file_path>',
    summary: 'Defines a template file for the packet. Used with template-based protocols.',
    parameters: [
      { name: 'file_path', description: 'Path to the template file', required: true },
    ],
  },
  RESPONSE: {
    syntax: 'RESPONSE <target_name> <packet_name>',
    summary: 'Defines the expected telemetry response packet for a command.',
    parameters: [
      { name: 'target_name', description: 'Target name of the response packet', required: true },
      { name: 'packet_name', description: 'Packet name of the response packet', required: true },
    ],
  },
  ERROR_RESPONSE: {
    syntax: 'ERROR_RESPONSE <target_name> <packet_name>',
    summary: 'Defines the expected telemetry error response packet for a command.',
    parameters: [
      { name: 'target_name', description: 'Target name of the error response packet', required: true },
      { name: 'packet_name', description: 'Packet name of the error response packet', required: true },
    ],
  },
  RELATED_ITEM: {
    syntax: 'RELATED_ITEM <target_name> <packet_name> <item_name>',
    summary: 'Defines a related telemetry item for the command.',
    parameters: [
      { name: 'target_name', description: 'Target name', required: true },
      { name: 'packet_name', description: 'Packet name', required: true },
      { name: 'item_name', description: 'Item name', required: true },
    ],
  },
  SCREEN: {
    syntax: 'SCREEN <target_name> <screen_name>',
    summary: 'Associates a telemetry screen with the command.',
    parameters: [
      { name: 'target_name', description: 'Target name', required: true },
      { name: 'screen_name', description: 'Screen name', required: true },
    ],
  },
  VIRTUAL: {
    syntax: 'VIRTUAL',
    summary: 'Marks the packet as virtual. Virtual packets are not transmitted or received over an interface.',
  },
  RESTRICTED: {
    syntax: 'RESTRICTED',
    summary: 'Marks the command as restricted. Restricted commands require elevated permissions to send.',
  },
  VALIDATOR: {
    syntax: 'VALIDATOR <class_filename> [args...]',
    summary: 'Defines a validator class to validate command parameters before sending.',
    parameters: [
      { name: 'class_filename', description: 'Filename of the validator class', required: true },
      { name: 'args', description: 'Additional arguments for the validator', required: false },
    ],
  },
  ALLOW_SHORT: {
    syntax: 'ALLOW_SHORT',
    summary: 'Allows the telemetry packet to be received with fewer bytes than defined.',
  },
  IGNORE_OVERLAP: {
    syntax: 'IGNORE_OVERLAP',
    summary: 'Ignores item overlap warnings for the current telemetry packet.',
  },
  PROCESSOR: {
    syntax: 'PROCESSOR <processor_name> <processor_class_filename> [args...]',
    summary: 'Defines a processor class for the telemetry packet to perform calculations on packet data.',
    parameters: [
      { name: 'processor_name', description: 'Unique name for this processor', required: true },
      { name: 'processor_class_filename', description: 'Filename of the processor class', required: true },
      { name: 'args', description: 'Additional arguments for the processor', required: false },
    ],
  },

  // ── Parameter / Item Modifiers ──
  FORMAT_STRING: {
    syntax: 'FORMAT_STRING <format>',
    summary: 'Sets a printf-style format string for displaying the parameter or item value.',
    parameters: [
      { name: 'format', description: 'Printf-style format string in quotes', required: true },
    ],
  },
  UNITS: {
    syntax: 'UNITS <full_name> <abbreviated>',
    summary: 'Defines the units for the parameter or item.',
    parameters: [
      { name: 'full_name', description: 'Full unit name (e.g., Celsius)', required: true },
      { name: 'abbreviated', description: 'Abbreviated unit name (e.g., C)', required: true },
    ],
  },
  DESCRIPTION: {
    syntax: 'DESCRIPTION <value>',
    summary: 'Sets the description for the current parameter or item.',
    parameters: [
      { name: 'value', description: 'Description string in quotes', required: true },
    ],
  },
  OVERLAP: {
    syntax: 'OVERLAP',
    summary: 'Marks the item as intentionally overlapping with another item in the packet.',
  },
  KEY: {
    syntax: 'KEY <key_string>',
    summary: 'Defines a key used to access the item in JSON or hash-based accessors.',
    parameters: [
      { name: 'key_string', description: 'Key path string', required: true },
    ],
  },
  VARIABLE_BIT_SIZE: {
    syntax: 'VARIABLE_BIT_SIZE <length_item_name> [length_bits_per_count] [length_value_bit_offset]',
    summary: 'Marks the item as having a variable bit size determined by another item.',
    parameters: [
      { name: 'length_item_name', description: 'Name of the item that defines the length', required: true },
      { name: 'length_bits_per_count', description: 'Number of bits per count (default 8)', required: false },
      { name: 'length_value_bit_offset', description: 'Bit offset to apply to the length value (default 0)', required: false },
    ],
  },
  OBFUSCATE: {
    syntax: 'OBFUSCATE',
    summary: 'Obfuscates the parameter or item value in displays and logs.',
  },
  REQUIRED: {
    syntax: 'REQUIRED',
    summary: 'Marks the command parameter as required. Users must explicitly set this parameter before sending.',
  },
  MINIMUM_VALUE: {
    syntax: 'MINIMUM_VALUE <value>',
    summary: 'Overrides the minimum allowed value for the parameter.',
    parameters: [
      { name: 'value', description: 'Minimum value', required: true },
    ],
  },
  MAXIMUM_VALUE: {
    syntax: 'MAXIMUM_VALUE <value>',
    summary: 'Overrides the maximum allowed value for the parameter.',
    parameters: [
      { name: 'value', description: 'Maximum value', required: true },
    ],
  },
  DEFAULT_VALUE: {
    syntax: 'DEFAULT_VALUE <value>',
    summary: 'Overrides the default value for the parameter.',
    parameters: [
      { name: 'value', description: 'Default value', required: true },
    ],
  },
  STATE: {
    syntax: 'STATE <key> <value> [color_or_option] [hazardous_description]',
    summary: 'Defines a named state that maps a string name to a numeric value.',
    parameters: [
      { name: 'key', description: 'State name string', required: true },
      { name: 'value', description: 'Corresponding numeric value', required: true },
      { name: 'color_or_option', description: 'For telemetry: a color (GREEN, YELLOW, RED). For commands: HAZARDOUS or DISABLE_MESSAGES.', required: false, values: ['GREEN', 'YELLOW', 'RED', 'HAZARDOUS', 'DISABLE_MESSAGES'] },
      { name: 'hazardous_description', description: 'Description of why the state is hazardous', required: false },
    ],
  },

  // ── Conversions ──
  WRITE_CONVERSION: {
    syntax: 'WRITE_CONVERSION <class_filename> [args...]',
    summary: 'Applies a write conversion class to the command parameter.',
    parameters: [
      { name: 'class_filename', description: 'Filename of the conversion class', required: true },
      { name: 'args', description: 'Additional arguments for the conversion', required: false },
    ],
  },
  READ_CONVERSION: {
    syntax: 'READ_CONVERSION <class_filename> [args...]',
    summary: 'Applies a read conversion class to the telemetry item.',
    parameters: [
      { name: 'class_filename', description: 'Filename of the conversion class', required: true },
      { name: 'args', description: 'Additional arguments for the conversion', required: false },
    ],
  },
  POLY_WRITE_CONVERSION: {
    syntax: 'POLY_WRITE_CONVERSION <c0> <c1> [c2] ... [cn]',
    summary: 'Applies a polynomial write conversion. The conversion is: value = C0 + C1*x + C2*x^2 + ...',
    parameters: [
      { name: 'c0', description: 'Coefficient C0', required: true },
      { name: 'c1...cn', description: 'Additional polynomial coefficients', required: false },
    ],
  },
  POLY_READ_CONVERSION: {
    syntax: 'POLY_READ_CONVERSION <c0> <c1> [c2] ... [cn]',
    summary: 'Applies a polynomial read conversion. The conversion is: value = C0 + C1*x + C2*x^2 + ...',
    parameters: [
      { name: 'c0', description: 'Coefficient C0', required: true },
      { name: 'c1...cn', description: 'Additional polynomial coefficients', required: false },
    ],
  },
  SEG_POLY_WRITE_CONVERSION: {
    syntax: 'SEG_POLY_WRITE_CONVERSION <lower_bound> <c0> <c1> [c2] ... [cn]',
    summary: 'Applies a segmented polynomial write conversion. Define multiple segments with different bounds.',
    parameters: [
      { name: 'lower_bound', description: 'Lower bound for this segment', required: true },
      { name: 'c0', description: 'Coefficient C0', required: true },
      { name: 'c1...cn', description: 'Additional polynomial coefficients', required: false },
    ],
  },
  SEG_POLY_READ_CONVERSION: {
    syntax: 'SEG_POLY_READ_CONVERSION <lower_bound> <c0> <c1> [c2] ... [cn]',
    summary: 'Applies a segmented polynomial read conversion. Define multiple segments with different bounds.',
    parameters: [
      { name: 'lower_bound', description: 'Lower bound for this segment', required: true },
      { name: 'c0', description: 'Coefficient C0', required: true },
      { name: 'c1...cn', description: 'Additional polynomial coefficients', required: false },
    ],
  },
  GENERIC_WRITE_CONVERSION_START: {
    syntax: 'GENERIC_WRITE_CONVERSION_START',
    summary: 'Starts a generic write conversion defined inline. Code follows on subsequent lines until GENERIC_WRITE_CONVERSION_END.',
  },
  GENERIC_WRITE_CONVERSION_END: {
    syntax: 'GENERIC_WRITE_CONVERSION_END',
    summary: 'Ends a generic write conversion block.',
  },
  GENERIC_READ_CONVERSION_START: {
    syntax: 'GENERIC_READ_CONVERSION_START [converted_type] [converted_bit_size]',
    summary: 'Starts a generic read conversion defined inline. Code follows on subsequent lines until GENERIC_READ_CONVERSION_END.',
    parameters: [
      { name: 'converted_type', description: 'Data type of the converted value', required: false, values: ['INT', 'UINT', 'FLOAT', 'STRING'] },
      { name: 'converted_bit_size', description: 'Bit size of the converted value', required: false },
    ],
  },
  GENERIC_READ_CONVERSION_END: {
    syntax: 'GENERIC_READ_CONVERSION_END',
    summary: 'Ends a generic read conversion block.',
  },

  // ── Overflow ──
  OVERFLOW: {
    syntax: 'OVERFLOW <behavior>',
    summary: 'Sets the overflow behavior for a command parameter value.',
    parameters: [
      { name: 'behavior', description: 'Overflow behavior', required: true, values: ['ERROR', 'ERROR_ALLOW_HEX', 'TRUNCATE', 'SATURATE'] },
    ],
  },

  // ── Limits ──
  LIMITS: {
    syntax: 'LIMITS <limits_set> <persistence> <initial_state> <red_low> <yellow_low> <yellow_high> <red_high> [green_low] [green_high]',
    summary: 'Defines limits checking for a telemetry item.',
    parameters: [
      { name: 'limits_set', description: 'Limits set name (e.g., DEFAULT)', required: true },
      { name: 'persistence', description: 'Number of samples before triggering', required: true },
      { name: 'initial_state', description: 'Initial limits state', required: true, values: ['ENABLED', 'DISABLED'] },
      { name: 'red_low', description: 'Red low limit', required: true },
      { name: 'yellow_low', description: 'Yellow low limit', required: true },
      { name: 'yellow_high', description: 'Yellow high limit', required: true },
      { name: 'red_high', description: 'Red high limit', required: true },
      { name: 'green_low', description: 'Green low limit (optional for green/blue transitions)', required: false },
      { name: 'green_high', description: 'Green high limit (optional for green/blue transitions)', required: false },
    ],
  },
  LIMITS_RESPONSE: {
    syntax: 'LIMITS_RESPONSE <response_class_filename> [args...]',
    summary: 'Defines a limits response class to execute when the item transitions limits states.',
    parameters: [
      { name: 'response_class_filename', description: 'Filename of the limits response class', required: true },
      { name: 'args', description: 'Additional arguments for the response', required: false },
    ],
  },
  LIMITS_GROUP: {
    syntax: 'LIMITS_GROUP <group_name>',
    summary: 'Defines a limits group for enabling and disabling related limits together.',
    parameters: [
      { name: 'group_name', description: 'Name of the limits group', required: true },
    ],
  },
  LIMITS_GROUP_ITEM: {
    syntax: 'LIMITS_GROUP_ITEM <target_name> <packet_name> <item_name>',
    summary: 'Adds a telemetry item to the current limits group.',
    parameters: [
      { name: 'target_name', description: 'Target name', required: true },
      { name: 'packet_name', description: 'Packet name', required: true },
      { name: 'item_name', description: 'Item name', required: true },
    ],
  },
};

// ─── Plugin keyword docs ────────────────────────────────────────────────────

export const pluginKeywordDocs: Record<string, KeywordDoc> = {
  // ── Global Plugin ──
  VARIABLE: {
    syntax: 'VARIABLE <variable_name> <default_value>',
    summary: 'Defines a plugin variable that can be set during plugin installation via ERB templates.',
    parameters: [
      { name: 'variable_name', description: 'Variable name (used as ERB variable)', required: true },
      { name: 'default_value', description: 'Default value for the variable', required: true },
    ],
  },
  NEEDS_DEPENDENCIES: {
    syntax: 'NEEDS_DEPENDENCIES',
    summary: 'Indicates that the plugin has dependencies that must be installed (e.g., gems or pip packages).',
  },

  // ── Interface ──
  INTERFACE: {
    syntax: 'INTERFACE <interface_name> <filename> [params...]',
    summary: 'Defines a new interface for communicating with a target.',
    parameters: [
      { name: 'interface_name', description: 'Unique interface name', required: true },
      { name: 'filename', description: 'Interface class filename', required: true },
      { name: 'params', description: 'Interface-specific parameters', required: false },
    ],
  },
  PROTOCOL: {
    syntax: 'PROTOCOL <direction> <protocol_filename> [params...]',
    summary: 'Adds a protocol to the current interface for data processing.',
    parameters: [
      { name: 'direction', description: 'Protocol direction', required: true, values: ['READ', 'WRITE', 'READ_WRITE'] },
      { name: 'protocol_filename', description: 'Protocol class filename', required: true },
      { name: 'params', description: 'Protocol-specific parameters', required: false },
    ],
  },
  OPTION: {
    syntax: 'OPTION <option_name> [option_value...]',
    summary: 'Sets an option on the current interface, router, or microservice.',
    parameters: [
      { name: 'option_name', description: 'Name of the option', required: true },
      { name: 'option_value', description: 'Value(s) for the option', required: false },
    ],
  },
  SECRET: {
    syntax: 'SECRET <type> <secret_name> <env_or_path> [option_name] [secret_store_name]',
    summary: 'Defines a secret to be injected at runtime as an environment variable or file.',
    parameters: [
      { name: 'type', description: 'Secret type', required: true, values: ['ENV', 'FILE'] },
      { name: 'secret_name', description: 'Name of the secret in the secret store', required: true },
      { name: 'env_or_path', description: 'Environment variable name or file path', required: true },
      { name: 'option_name', description: 'Interface option to pass the secret to', required: false },
      { name: 'secret_store_name', description: 'Name of the secret store', required: false },
    ],
  },
  ENV: {
    syntax: 'ENV <key> <value>',
    summary: 'Sets an environment variable for the current interface, router, or microservice.',
    parameters: [
      { name: 'key', description: 'Environment variable name', required: true },
      { name: 'value', description: 'Environment variable value', required: true },
    ],
  },
  MAP_TARGET: {
    syntax: 'MAP_TARGET <target_name>',
    summary: 'Maps a target to the current interface for both commands and telemetry.',
    parameters: [
      { name: 'target_name', description: 'Name of the target to map', required: true },
    ],
  },
  MAP_CMD_TARGET: {
    syntax: 'MAP_CMD_TARGET <target_name>',
    summary: 'Maps a target to the current interface for commands only.',
    parameters: [
      { name: 'target_name', description: 'Name of the target to map for commands', required: true },
    ],
  },
  MAP_TLM_TARGET: {
    syntax: 'MAP_TLM_TARGET <target_name>',
    summary: 'Maps a target to the current interface for telemetry only.',
    parameters: [
      { name: 'target_name', description: 'Name of the target to map for telemetry', required: true },
    ],
  },

  // ── Router ──
  ROUTER: {
    syntax: 'ROUTER <router_name> <filename> [params...]',
    summary: 'Defines a new router for routing commands and telemetry to other interfaces.',
    parameters: [
      { name: 'router_name', description: 'Unique router name', required: true },
      { name: 'filename', description: 'Router class filename', required: true },
      { name: 'params', description: 'Router-specific parameters', required: false },
    ],
  },
  ROUTE: {
    syntax: 'ROUTE <interface_name>',
    summary: 'Maps a router to an existing interface.',
    parameters: [
      { name: 'interface_name', description: 'Name of the interface to route to', required: true },
    ],
  },

  // ── Target ──
  TARGET: {
    syntax: 'TARGET <folder_name> <target_name>',
    summary: 'Defines a target using files from a target folder in the plugin.',
    parameters: [
      { name: 'folder_name', description: 'Target folder name in the plugin', required: true },
      { name: 'target_name', description: 'Name to assign to the target', required: true },
    ],
  },

  // ── Target Modifiers ──
  CMD_BUFFER_DEPTH: {
    syntax: 'CMD_BUFFER_DEPTH <depth>',
    summary: 'Sets the command buffer depth for the target.',
    parameters: [
      { name: 'depth', description: 'Buffer depth (number of commands)', required: true },
    ],
  },
  CMD_LOG_CYCLE_TIME: {
    syntax: 'CMD_LOG_CYCLE_TIME <time>',
    summary: 'Sets the command log file cycle time in seconds.',
    parameters: [
      { name: 'time', description: 'Cycle time in seconds', required: true },
    ],
  },
  CMD_LOG_CYCLE_SIZE: {
    syntax: 'CMD_LOG_CYCLE_SIZE <size>',
    summary: 'Sets the command log file cycle size in bytes.',
    parameters: [
      { name: 'size', description: 'Cycle size in bytes', required: true },
    ],
  },
  CMD_LOG_RETAIN_TIME: {
    syntax: 'CMD_LOG_RETAIN_TIME <time>',
    summary: 'Sets the command log file retention time in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  CMD_DECOM_LOG_CYCLE_TIME: {
    syntax: 'CMD_DECOM_LOG_CYCLE_TIME <time>',
    summary: 'Sets the decommutated command log file cycle time in seconds.',
    parameters: [
      { name: 'time', description: 'Cycle time in seconds', required: true },
    ],
  },
  CMD_DECOM_LOG_CYCLE_SIZE: {
    syntax: 'CMD_DECOM_LOG_CYCLE_SIZE <size>',
    summary: 'Sets the decommutated command log file cycle size in bytes.',
    parameters: [
      { name: 'size', description: 'Cycle size in bytes', required: true },
    ],
  },
  CMD_DECOM_LOG_RETAIN_TIME: {
    syntax: 'CMD_DECOM_LOG_RETAIN_TIME <time>',
    summary: 'Sets the decommutated command log file retention time in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  TLM_BUFFER_DEPTH: {
    syntax: 'TLM_BUFFER_DEPTH <depth>',
    summary: 'Sets the telemetry buffer depth for the target.',
    parameters: [
      { name: 'depth', description: 'Buffer depth (number of packets)', required: true },
    ],
  },
  TLM_LOG_CYCLE_TIME: {
    syntax: 'TLM_LOG_CYCLE_TIME <time>',
    summary: 'Sets the telemetry log file cycle time in seconds.',
    parameters: [
      { name: 'time', description: 'Cycle time in seconds', required: true },
    ],
  },
  TLM_LOG_CYCLE_SIZE: {
    syntax: 'TLM_LOG_CYCLE_SIZE <size>',
    summary: 'Sets the telemetry log file cycle size in bytes.',
    parameters: [
      { name: 'size', description: 'Cycle size in bytes', required: true },
    ],
  },
  TLM_LOG_RETAIN_TIME: {
    syntax: 'TLM_LOG_RETAIN_TIME <time>',
    summary: 'Sets the telemetry log file retention time in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  TLM_DECOM_LOG_CYCLE_TIME: {
    syntax: 'TLM_DECOM_LOG_CYCLE_TIME <time>',
    summary: 'Sets the decommutated telemetry log file cycle time in seconds.',
    parameters: [
      { name: 'time', description: 'Cycle time in seconds', required: true },
    ],
  },
  TLM_DECOM_LOG_CYCLE_SIZE: {
    syntax: 'TLM_DECOM_LOG_CYCLE_SIZE <size>',
    summary: 'Sets the decommutated telemetry log file cycle size in bytes.',
    parameters: [
      { name: 'size', description: 'Cycle size in bytes', required: true },
    ],
  },
  TLM_DECOM_LOG_RETAIN_TIME: {
    syntax: 'TLM_DECOM_LOG_RETAIN_TIME <time>',
    summary: 'Sets the decommutated telemetry log file retention time in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  REDUCED_MINUTE_LOG_RETAIN_TIME: {
    syntax: 'REDUCED_MINUTE_LOG_RETAIN_TIME <time>',
    summary: 'Sets the reduced minute log file retention time in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  REDUCED_HOUR_LOG_RETAIN_TIME: {
    syntax: 'REDUCED_HOUR_LOG_RETAIN_TIME <time>',
    summary: 'Sets the reduced hour log file retention time in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  REDUCED_DAY_LOG_RETAIN_TIME: {
    syntax: 'REDUCED_DAY_LOG_RETAIN_TIME <time>',
    summary: 'Sets the reduced day log file retention time in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  LOG_RETAIN_TIME: {
    syntax: 'LOG_RETAIN_TIME <time>',
    summary: 'Sets the retention time for all log files in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  REDUCED_LOG_RETAIN_TIME: {
    syntax: 'REDUCED_LOG_RETAIN_TIME <time>',
    summary: 'Sets the retention time for all reduced log files in seconds.',
    parameters: [
      { name: 'time', description: 'Retention time in seconds (nil for unlimited)', required: true },
    ],
  },
  CLEANUP_POLL_TIME: {
    syntax: 'CLEANUP_POLL_TIME <time>',
    summary: 'Sets the poll time for the cleanup microservice in seconds.',
    parameters: [
      { name: 'time', description: 'Poll time in seconds', required: true },
    ],
  },
  REDUCER_DISABLE: {
    syntax: 'REDUCER_DISABLE',
    summary: 'Disables the data reducer for the target.',
  },
  REDUCER_MAX_CPU_UTILIZATION: {
    syntax: 'REDUCER_MAX_CPU_UTILIZATION <percentage>',
    summary: 'Sets the maximum CPU utilization percentage for the reducer microservice.',
    parameters: [
      { name: 'percentage', description: 'Maximum CPU percentage (0-100)', required: true },
    ],
  },
  TARGET_MICROSERVICE: {
    syntax: 'TARGET_MICROSERVICE <type>',
    summary: 'Selects a target microservice for modification.',
    parameters: [
      { name: 'type', description: 'Microservice type', required: true, values: ['DECOM', 'COMMANDLOG', 'DECOMCMDLOG', 'PACKETLOG', 'DECOMLOG', 'REDUCER', 'CLEANUP'] },
    ],
  },
  PACKET: {
    syntax: 'PACKET <packet_name>',
    summary: 'Assigns a specific packet to the current target microservice. Used after TARGET_MICROSERVICE.',
    parameters: [
      { name: 'packet_name', description: 'Packet name to assign', required: true },
    ],
  },
  DISABLE_ERB: {
    syntax: 'DISABLE_ERB [regex]',
    summary: 'Disables ERB template processing. If a regex is given, only matching files are skipped.',
    parameters: [
      { name: 'regex', description: 'Optional regex to match files to skip', required: false },
    ],
  },
  SHARD: {
    syntax: 'SHARD [shard_number]',
    summary: 'Assigns the target or microservice to a specific shard for horizontal scaling.',
    parameters: [
      { name: 'shard_number', description: 'Shard number', required: false },
    ],
  },

  // ── Microservice ──
  MICROSERVICE: {
    syntax: 'MICROSERVICE <folder_name> <microservice_name>',
    summary: 'Defines a custom microservice in the plugin.',
    parameters: [
      { name: 'folder_name', description: 'Folder name containing the microservice code', required: true },
      { name: 'microservice_name', description: 'Unique microservice name', required: true },
    ],
  },
  TOPIC: {
    syntax: 'TOPIC <topic_name>',
    summary: 'Adds a topic for the microservice to subscribe to.',
    parameters: [
      { name: 'topic_name', description: 'Topic name', required: true },
    ],
  },
  TARGET_NAME: {
    syntax: 'TARGET_NAME <target_name>',
    summary: 'Associates a target name with the current microservice.',
    parameters: [
      { name: 'target_name', description: 'Target name', required: true },
    ],
  },
  STOPPED: {
    syntax: 'STOPPED',
    summary: 'Starts the microservice in a stopped state. Must be manually started.',
  },
  WORK_DIR: {
    syntax: 'WORK_DIR <directory>',
    summary: 'Sets the working directory for the microservice.',
    parameters: [
      { name: 'directory', description: 'Working directory path', required: true },
    ],
  },
  PORT: {
    syntax: 'PORT <number> [protocol]',
    summary: 'Exposes a port from the microservice container.',
    parameters: [
      { name: 'number', description: 'Port number', required: true },
      { name: 'protocol', description: 'Protocol (default TCP)', required: false },
    ],
  },
  CMD: {
    syntax: 'CMD <args...>',
    summary: 'Sets the command line arguments for the microservice.',
    parameters: [
      { name: 'args', description: 'Command line arguments', required: true },
    ],
  },
  CONTAINER: {
    syntax: 'CONTAINER [args...]',
    summary: 'Specifies a custom Docker container for the microservice.',
    parameters: [
      { name: 'args', description: 'Container arguments', required: false },
    ],
  },
  ROUTE_PREFIX: {
    syntax: 'ROUTE_PREFIX <prefix>',
    summary: 'Sets the HTTP route prefix for the microservice.',
    parameters: [
      { name: 'prefix', description: 'Route prefix path', required: true },
    ],
  },

  // ── Tool ──
  TOOL: {
    syntax: 'TOOL <folder_name> <tool_name>',
    summary: 'Defines a custom tool (web application) in the plugin.',
    parameters: [
      { name: 'folder_name', description: 'Folder name containing the tool code', required: true },
      { name: 'tool_name', description: 'Display name of the tool', required: true },
    ],
  },
  URL: {
    syntax: 'URL <url>',
    summary: 'Sets the URL for the tool.',
    parameters: [
      { name: 'url', description: 'URL path', required: true },
    ],
  },
  INLINE_URL: {
    syntax: 'INLINE_URL <url>',
    summary: 'Sets the inline URL for the tool, used when embedded inline.',
    parameters: [
      { name: 'url', description: 'Inline URL path', required: true },
    ],
  },
  WINDOW: {
    syntax: 'WINDOW <window_mode>',
    summary: 'Sets how the tool window is displayed.',
    parameters: [
      { name: 'window_mode', description: 'Window display mode', required: true, values: ['INLINE', 'IFRAME', 'NEW'] },
    ],
  },
  ICON: {
    syntax: 'ICON <icon_name>',
    summary: 'Sets the icon for the tool in the navigation menu.',
    parameters: [
      { name: 'icon_name', description: 'Icon name (Material Design icon)', required: true },
    ],
  },
  CATEGORY: {
    syntax: 'CATEGORY <category_name>',
    summary: 'Sets the category for the tool in the navigation menu.',
    parameters: [
      { name: 'category_name', description: 'Category name', required: true },
    ],
  },
  SHOWN: {
    syntax: 'SHOWN <shown>',
    summary: 'Sets whether the tool is shown in the navigation menu.',
    parameters: [
      { name: 'shown', description: 'Whether tool is visible', required: true, values: ['true', 'false'] },
    ],
  },
  POSITION: {
    syntax: 'POSITION <position>',
    summary: 'Sets the position of the tool in the navigation menu.',
    parameters: [
      { name: 'position', description: 'Numeric position', required: true },
    ],
  },
  IMPORT_MAP_ITEM: {
    syntax: 'IMPORT_MAP_ITEM <key> <value>',
    summary: 'Adds an import map entry for the tool. Used for JavaScript module resolution.',
    parameters: [
      { name: 'key', description: 'Import map key', required: true },
      { name: 'value', description: 'Import map value (URL)', required: true },
    ],
  },

  // ── Widget ──
  WIDGET: {
    syntax: 'WIDGET <widget_name> [label]',
    summary: 'Defines a custom widget for use in telemetry screens.',
    parameters: [
      { name: 'widget_name', description: 'Widget name', required: true },
      { name: 'label', description: 'Display label', required: false },
    ],
  },

  // ── Script Engine ──
  SCRIPT_ENGINE: {
    syntax: 'SCRIPT_ENGINE <extension> <filename>',
    summary: 'Defines a custom script engine for handling scripts with a specific file extension.',
    parameters: [
      { name: 'extension', description: 'File extension (e.g., .py)', required: true },
      { name: 'filename', description: 'Script engine class filename', required: true },
    ],
  },
};

// ─── Target keyword docs ────────────────────────────────────────────────────

export const targetKeywordDocs: Record<string, KeywordDoc> = {
  LANGUAGE: {
    syntax: 'LANGUAGE <language>',
    summary: 'Sets the programming language for the target.',
    parameters: [
      { name: 'language', description: 'Programming language', required: true, values: ['ruby', 'python'] },
    ],
  },
  REQUIRE: {
    syntax: 'REQUIRE <filename>',
    summary: 'Requires a Ruby or Python file to extend the target functionality.',
    parameters: [
      { name: 'filename', description: 'Filename to require', required: true },
    ],
  },
  IGNORE_PARAMETER: {
    syntax: 'IGNORE_PARAMETER <parameter_name>',
    summary: 'Ignores the specified command parameter. It will not be displayed or required.',
    parameters: [
      { name: 'parameter_name', description: 'Name of the command parameter to ignore', required: true },
    ],
  },
  IGNORE_ITEM: {
    syntax: 'IGNORE_ITEM <item_name>',
    summary: 'Ignores the specified telemetry item. It will not be displayed.',
    parameters: [
      { name: 'item_name', description: 'Name of the telemetry item to ignore', required: true },
    ],
  },
  COMMANDS: {
    syntax: 'COMMANDS <filename>',
    summary: 'Specifies an additional command definition file to process.',
    parameters: [
      { name: 'filename', description: 'Filename of the command definition file', required: true },
    ],
  },
  TELEMETRY: {
    syntax: 'TELEMETRY <filename>',
    summary: 'Specifies an additional telemetry definition file to process.',
    parameters: [
      { name: 'filename', description: 'Filename of the telemetry definition file', required: true },
    ],
  },
  CMD_UNIQUE_ID_MODE: {
    syntax: 'CMD_UNIQUE_ID_MODE',
    summary: 'Enables unique ID mode for commands. Commands are identified by ID parameters rather than name.',
  },
  TLM_UNIQUE_ID_MODE: {
    syntax: 'TLM_UNIQUE_ID_MODE',
    summary: 'Enables unique ID mode for telemetry. Telemetry packets are identified by ID items rather than name.',
  },
};
