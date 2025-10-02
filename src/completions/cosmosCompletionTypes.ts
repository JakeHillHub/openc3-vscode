export interface CompletionArgument {
  title: string;
  options: string[];
  required: boolean;
  /* Generate highly custom suggestions for an individual field */
  optionTransformer?: (
    linePrefix: string,
    arg: CompletionArgument,
    index: number
  ) => string | undefined;
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
export const typeConstantsWithoutDerived = ['INT', 'UINT', 'FLOAT', 'STRING', 'BLOCK'];
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

function sanitizeErbStrs(linePrefix: string): string {
  const erbRegex = /<%.*?%>/g; /* Handle erb substitution */
  const strRegex = /".*?"/g;
  return linePrefix.replace(erbRegex, 'erb').replace(strRegex, 'str');
}

function deriveBitSize(linePrefix: string): string {
  const sanitized = sanitizeErbStrs(linePrefix);
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

function deriveType(linePrefix: string): string {
  const sanitized = sanitizeErbStrs(linePrefix);
  if (sanitized.startsWith('APPEND')) {
    const split = sanitized.split(' ');
    return split[3];
  } else {
    const split = sanitized.split(' ');
    return split[4];
  }
}

export function getArgumentIndex(linePrefix: string): number {
  const sanitized = sanitizeErbStrs(linePrefix);
  const split = sanitized.split(' ');
  const final = split.filter((item) => item !== '');
  return final.length - 1;
}

export function magicalTypeConstants(
  linePrefix: string,
  arg: CompletionArgument,
  index: number
): string | undefined {
  const bitSizeStr = deriveBitSize(linePrefix);
  const t = deriveType(linePrefix);
  const opts = arg.options.filter((option) => option.includes(bitSizeStr) && option.includes(t));
  if (opts.length === 0) {
    return undefined;
  }
  return `\${${index}|${opts.sort().reverse().join(',')}|}`;
}

export function idTypeConstants(..._: unknown[]): string | undefined {
  /* Generate all id type constants with the same tabstop (1) so they update simultaneously */
  return `\${${1}| |}`;
}
