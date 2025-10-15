grammar CosmosScript;

// --- PARSER RULES (Structure) --------------------------------------------

// Entry point: A script can contain multiple statements, but for completion, we focus on a single command.
script : commandCall+ EOF;

// A high-level rule covering all potential command call styles.
commandCall 
    // FIXED: Use the capitalized tokens (CMD, CMD_RAW, TLM) directly here.
    : (CMD | CMD_RAW | TLM) OPEN_PAREN cmdArgumentList CLOSE_PAREN 
    ;

// Handles the internal structure of arguments, which can be a single string 
// or a sequence of comma-separated expressions.
cmdArgumentList 
    : cmdInlineArgList                     // e.g., cmd("TARGET CMD with P V")
    | cmdPositionalArgList                // e.g., cmd("TGT", "CMD", ...)
    ;

// Style 1: Single, space-delimited string argument with optional 'with' mappings
cmdInlineArgList
    : QUOTED_STRING (WITH parameterMapping)?
    ;

// The structure of the key-value parameters inside the single string argument.
// Assumes space-separated pairs: KEY VALUE KEY2 VALUE2
parameterMapping
    : ID (QUOTED_STRING | ID) (ID (QUOTED_STRING | ID))*
    ;

// Style 2: Comma-separated list of arguments (TGT, MNEMONIC, {PARAMS})
cmdPositionalArgList
    : commandExpression (COMMA commandExpression)*
    ;

// An expression can be a string, a hash map, or a raw identifier/number.
commandExpression
    : QUOTED_STRING
    | ID
    | HASH_MAP
    ;
    
// Simplified hash map token to capture the structure of {"KEY": "VAL"}
// We will refine the internal parsing of the hash map later, but for now, we capture the boundary.
HASH_MAP : OPEN_BRACE (~[}\r\n])* CLOSE_BRACE ; // Captures everything between {}


// --- LEXER RULES (Tokens) ------------------------------------------------

// FIXED: These are now full Lexer Tokens (uppercase) and can be used directly 
// in the Parser rule 'commandCall'. We removed the 'fragment' keyword.
CMD     : 'cmd' ;
CMD_RAW : 'cmd_raw' ;
TLM     : 'tlm' ; 

// Fixed keywords used inside the single argument string
WITH        : 'with' ;

// Delimiters
OPEN_PAREN  : '(' ;
CLOSE_PAREN : ')' ;
COMMA       : ',' ;
COLON       : ':' ;
OPEN_BRACE  : '{' ;
CLOSE_BRACE : '}' ;

// Core data types
QUOTED_STRING : 
      '"' ( ~["\r\n] )* '"'  // Matches double-quoted strings
    | '\'' ( ~['\r\n] )* '\'' // Matches single-quoted strings
    ;

// Identifiers for targets, mnemonics, and unquoted parameter keys/values
ID          : [a-zA-Z_] [a-zA-Z0-9_]* ; 

// Ignore whitespace
WS          : [ \t\r\n]+ -> skip ; 
