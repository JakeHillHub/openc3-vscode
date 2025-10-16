// Generated from src/antlr/configuration/CosmosConfigLexer.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class CosmosConfigLexer extends Lexer {
	public static readonly WHITESPACE = 1;
	public static readonly OG_STUFF = 2;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"WHITESPACE", "OG_STUFF",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, "'OG'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "WHITESPACE", "OG_STUFF",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CosmosConfigLexer._LITERAL_NAMES, CosmosConfigLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CosmosConfigLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(CosmosConfigLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "CosmosConfigLexer.g4"; }

	// @Override
	public get ruleNames(): string[] { return CosmosConfigLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return CosmosConfigLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return CosmosConfigLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return CosmosConfigLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x04\f\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x02\x02" +
		"\x02\x04\x03\x02\x03\x05\x02\x04\x03\x02\x03\x04\x02\v\v\"\"\x02\v\x02" +
		"\x03\x03\x02\x02\x02\x02\x05\x03\x02\x02\x02\x03\x07\x03\x02\x02\x02\x05" +
		"\t\x03\x02\x02\x02\x07\b\t\x02\x02\x02\b\x04\x03\x02\x02\x02\t\n\x07Q" +
		"\x02\x02\n\v\x07I\x02\x02\v\x06\x03\x02\x02\x02\x03\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CosmosConfigLexer.__ATN) {
			CosmosConfigLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CosmosConfigLexer._serializedATN));
		}

		return CosmosConfigLexer.__ATN;
	}

}

