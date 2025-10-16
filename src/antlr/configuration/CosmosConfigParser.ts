// Generated from src/antlr/configuration/CosmosConfigParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { CosmosConfigParserListener } from "./CosmosConfigParserListener";
import { CosmosConfigParserVisitor } from "./CosmosConfigParserVisitor";


export class CosmosConfigParser extends Parser {
	public static readonly WHITESPACE = 1;
	public static readonly OG_STUFF = 2;
	public static readonly RULE_testRule = 0;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"testRule",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, undefined, "'OG'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "WHITESPACE", "OG_STUFF",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CosmosConfigParser._LITERAL_NAMES, CosmosConfigParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CosmosConfigParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "CosmosConfigParser.g4"; }

	// @Override
	public get ruleNames(): string[] { return CosmosConfigParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return CosmosConfigParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(CosmosConfigParser._ATN, this);
	}
	// @RuleVersion(0)
	public testRule(): TestRuleContext {
		let _localctx: TestRuleContext = new TestRuleContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, CosmosConfigParser.RULE_testRule);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 2;
			this.match(CosmosConfigParser.OG_STUFF);
			this.state = 3;
			this.match(CosmosConfigParser.WHITESPACE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x04\b\x04\x02" +
		"\t\x02\x03\x02\x03\x02\x03\x02\x03\x02\x02\x02\x02\x03\x02\x02\x02\x02" +
		"\x02\x06\x02\x04\x03\x02\x02\x02\x04\x05\x07\x04\x02\x02\x05\x06\x07\x03" +
		"\x02\x02\x06\x03\x03\x02\x02\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CosmosConfigParser.__ATN) {
			CosmosConfigParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CosmosConfigParser._serializedATN));
		}

		return CosmosConfigParser.__ATN;
	}

}

export class TestRuleContext extends ParserRuleContext {
	public OG_STUFF(): TerminalNode { return this.getToken(CosmosConfigParser.OG_STUFF, 0); }
	public WHITESPACE(): TerminalNode { return this.getToken(CosmosConfigParser.WHITESPACE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CosmosConfigParser.RULE_testRule; }
	// @Override
	public enterRule(listener: CosmosConfigParserListener): void {
		if (listener.enterTestRule) {
			listener.enterTestRule(this);
		}
	}
	// @Override
	public exitRule(listener: CosmosConfigParserListener): void {
		if (listener.exitTestRule) {
			listener.exitTestRule(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CosmosConfigParserVisitor<Result>): Result {
		if (visitor.visitTestRule) {
			return visitor.visitTestRule(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


