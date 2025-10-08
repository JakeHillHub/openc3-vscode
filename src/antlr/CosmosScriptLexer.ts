// Generated from src/antlr/CosmosScript.g4 by ANTLR 4.9.0-SNAPSHOT


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


export class CosmosScriptLexer extends Lexer {
	public static readonly HASH_MAP = 1;
	public static readonly CMD = 2;
	public static readonly CMD_RAW = 3;
	public static readonly TLM = 4;
	public static readonly WITH = 5;
	public static readonly OPEN_PAREN = 6;
	public static readonly CLOSE_PAREN = 7;
	public static readonly COMMA = 8;
	public static readonly COLON = 9;
	public static readonly OPEN_BRACE = 10;
	public static readonly CLOSE_BRACE = 11;
	public static readonly QUOTED_STRING = 12;
	public static readonly ID = 13;
	public static readonly WS = 14;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"HASH_MAP", "CMD", "CMD_RAW", "TLM", "WITH", "OPEN_PAREN", "CLOSE_PAREN", 
		"COMMA", "COLON", "OPEN_BRACE", "CLOSE_BRACE", "QUOTED_STRING", "ID", 
		"WS",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, "'cmd'", "'cmd_raw'", "'tlm'", "'with'", "'('", 
		"')'", "','", "':'", "'{'", "'}'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "HASH_MAP", "CMD", "CMD_RAW", "TLM", "WITH", "OPEN_PAREN", 
		"CLOSE_PAREN", "COMMA", "COLON", "OPEN_BRACE", "CLOSE_BRACE", "QUOTED_STRING", 
		"ID", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CosmosScriptLexer._LITERAL_NAMES, CosmosScriptLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CosmosScriptLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(CosmosScriptLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "CosmosScript.g4"; }

	// @Override
	public get ruleNames(): string[] { return CosmosScriptLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return CosmosScriptLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return CosmosScriptLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return CosmosScriptLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x10i\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
		"\x04\x0E\t\x0E\x04\x0F\t\x0F\x03\x02\x03\x02\x07\x02\"\n\x02\f\x02\x0E" +
		"\x02%\v\x02\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04\x03" +
		"\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03" +
		"\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03\x07\x03\x07\x03" +
		"\b\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x07" +
		"\rL\n\r\f\r\x0E\rO\v\r\x03\r\x03\r\x03\r\x07\rT\n\r\f\r\x0E\rW\v\r\x03" +
		"\r\x05\rZ\n\r\x03\x0E\x03\x0E\x07\x0E^\n\x0E\f\x0E\x0E\x0Ea\v\x0E\x03" +
		"\x0F\x06\x0Fd\n\x0F\r\x0F\x0E\x0Fe\x03\x0F\x03\x0F\x02\x02\x02\x10\x03" +
		"\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07\r\x02\b\x0F\x02\t" +
		"\x11\x02\n\x13\x02\v\x15\x02\f\x17\x02\r\x19\x02\x0E\x1B\x02\x0F\x1D\x02" +
		"\x10\x03\x02\b\x02\x02\x05\x02\f\f\x0F\x0F$$\x05\x02\f\f\x0F\x0F))\x05" +
		"\x02C\\aac|\x06\x022;C\\aac|\x05\x02\v\f\x0F\x0F\"\"\x02n\x02\x03\x03" +
		"\x02\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02\t\x03" +
		"\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02" +
		"\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02" +
		"\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02" +
		"\x02\x02\x02\x1D\x03\x02\x02\x02\x03\x1F\x03\x02\x02\x02\x05(\x03\x02" +
		"\x02\x02\x07,\x03\x02\x02\x02\t4\x03\x02\x02\x02\v8\x03\x02\x02\x02\r" +
		"=\x03\x02\x02\x02\x0F?\x03\x02\x02\x02\x11A\x03\x02\x02\x02\x13C\x03\x02" +
		"\x02\x02\x15E\x03\x02\x02\x02\x17G\x03\x02\x02\x02\x19Y\x03\x02\x02\x02" +
		"\x1B[\x03\x02\x02\x02\x1Dc\x03\x02\x02\x02\x1F#\x05\x15\v\x02 \"\n\x02" +
		"\x02\x02! \x03\x02\x02\x02\"%\x03\x02\x02\x02#!\x03\x02\x02\x02#$\x03" +
		"\x02\x02\x02$&\x03\x02\x02\x02%#\x03\x02\x02\x02&\'\x05\x17\f\x02\'\x04" +
		"\x03\x02\x02\x02()\x07e\x02\x02)*\x07o\x02\x02*+\x07f\x02\x02+\x06\x03" +
		"\x02\x02\x02,-\x07e\x02\x02-.\x07o\x02\x02./\x07f\x02\x02/0\x07a\x02\x02" +
		"01\x07t\x02\x0212\x07c\x02\x0223\x07y\x02\x023\b\x03\x02\x02\x0245\x07" +
		"v\x02\x0256\x07n\x02\x0267\x07o\x02\x027\n\x03\x02\x02\x0289\x07y\x02" +
		"\x029:\x07k\x02\x02:;\x07v\x02\x02;<\x07j\x02\x02<\f\x03\x02\x02\x02=" +
		">\x07*\x02\x02>\x0E\x03\x02\x02\x02?@\x07+\x02\x02@\x10\x03\x02\x02\x02" +
		"AB\x07.\x02\x02B\x12\x03\x02\x02\x02CD\x07<\x02\x02D\x14\x03\x02\x02\x02" +
		"EF\x07}\x02\x02F\x16\x03\x02\x02\x02GH\x07\x7F\x02\x02H\x18\x03\x02\x02" +
		"\x02IM\x07$\x02\x02JL\n\x03\x02\x02KJ\x03\x02\x02\x02LO\x03\x02\x02\x02" +
		"MK\x03\x02\x02\x02MN\x03\x02\x02\x02NP\x03\x02\x02\x02OM\x03\x02\x02\x02" +
		"PZ\x07$\x02\x02QU\x07)\x02\x02RT\n\x04\x02\x02SR\x03\x02\x02\x02TW\x03" +
		"\x02\x02\x02US\x03\x02\x02\x02UV\x03\x02\x02\x02VX\x03\x02\x02\x02WU\x03" +
		"\x02\x02\x02XZ\x07)\x02\x02YI\x03\x02\x02\x02YQ\x03\x02\x02\x02Z\x1A\x03" +
		"\x02\x02\x02[_\t\x05\x02\x02\\^\t\x06\x02\x02]\\\x03\x02\x02\x02^a\x03" +
		"\x02\x02\x02_]\x03\x02\x02\x02_`\x03\x02\x02\x02`\x1C\x03\x02\x02\x02" +
		"a_\x03\x02\x02\x02bd\t\x07\x02\x02cb\x03\x02\x02\x02de\x03\x02\x02\x02" +
		"ec\x03\x02\x02\x02ef\x03\x02\x02\x02fg\x03\x02\x02\x02gh\b\x0F\x02\x02" +
		"h\x1E\x03\x02\x02\x02\t\x02#MUY_e\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CosmosScriptLexer.__ATN) {
			CosmosScriptLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CosmosScriptLexer._serializedATN));
		}

		return CosmosScriptLexer.__ATN;
	}

}

