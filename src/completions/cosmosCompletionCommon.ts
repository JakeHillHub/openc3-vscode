export interface CompletionArgument {
  title: string;
  options: string[];
  required: boolean;
  optionTransformer?: (linePrefix: string, arg: CompletionArgument) => string[] | undefined;
}

export interface CompletionDefinition {
  title: string;
  args: CompletionArgument[];
}

export interface ContextualChoice {
  condition: RegExp;
  title: string;
  args: CompletionArgument[];
}

export interface ContextualDefinition {
  match: RegExp;
  choices: ContextualChoice[];
}

export const frequentlyUsedBitSize = ['8', '16', '32', '64'];
export const endianOpts = ['BIG_ENDIAN', 'LITTLE_ENDIAN'];
export const typeConstants = ['INT', 'UINT', 'FLOAT', 'DERIVED', 'STRING', 'BLOCK'];
export const typeMinConstants = [
  'MIN_UINT8',
  'MIN_INT8',
  'MIN_UINT16',
  'MIN_INT16',
  'MIN_UINT32',
  'MIN_INT32',
  'MIN_UINT64',
  'MIN_INT64',
  'MIN_FLOAT32',
  'MIN_FLOAT64',
];
export const typeMaxConstants = [
  'MAX_UINT8',
  'MAX_INT8',
  'MAX_UINT16',
  'MAX_INT16',
  'MAX_UINT32',
  'MAX_INT32',
  'MAX_UINT64',
  'MAX_INT64',
  'MAX_FLOAT32',
  'MAX_FLOAT64',
];
export const typeDefaultConstants = [...typeMinConstants, ...typeMaxConstants];

function removeErb(linePrefix: string): string {
  const argRegex = /<%.*?%>/g; /* Handle erb substitution */
  return linePrefix.replace(argRegex, '');
}

function deriveBitSize(linePrefix: string): string {
  const sanitized = removeErb(linePrefix);
  if (sanitized.startsWith('APPEND')) {
    /* Bit size is third parameter (index 2) */
    const split = sanitized.split(' ');
    return split[2];
  } else {
    /* Regular ID_PARAMETER or PARAMETER */
    /* Bit size is fourth parameter (index 3) */
    const split = sanitized.split(' ');
    return split[3];
  }
}

export function getArgumentIndex(linePrefix: string): number {
  const sanitized = removeErb(linePrefix);
  const split = sanitized.split(' ');
  const final = split.filter((item) => item !== '');
  return final.length - 1;
}

export function magicalTypeConstants(
  linePrefix: string,
  arg: CompletionArgument
): string[] | undefined {
  const bitSizeStr = deriveBitSize(linePrefix);
  const opts = arg.options.filter((option) => option.includes(bitSizeStr));
  if (opts.length === 0) {
    return undefined;
  }
  return opts.sort();
}

export function idTypeConstants()
