parser grammar CosmosConfigParser;

options {
    tokenVocab = CosmosConfigLexer; // Links to the lexer grammar file
}

testRule : OG_STUFF WHITESPACE ;
