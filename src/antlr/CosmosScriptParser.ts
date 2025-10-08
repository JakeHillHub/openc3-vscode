// Generated from src/antlr/CosmosScript.g4 by ANTLR 4.9.0-SNAPSHOT


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

import { CosmosScriptListener } from "./CosmosScriptListener";
import { CosmosScriptVisitor } from "./CosmosScriptVisitor";


export class CosmosScriptParser extends Parser {
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
	public static readonly RULE_script = 0;
	public static readonly RULE_commandCall = 1;
	public static readonly RULE_argumentList = 2;
	public static readonly RULE_stringArgList = 3;
	public static readonly RULE_parameterMapping = 4;
	public static readonly RULE_commaSeparatedList = 5;
	public static readonly RULE_commandExpression = 6;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"script", "commandCall", "argumentList", "stringArgList", "parameterMapping", 
		"commaSeparatedList", "commandExpression",
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
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CosmosScriptParser._LITERAL_NAMES, CosmosScriptParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CosmosScriptParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "CosmosScript.g4"; }

	// @Override
	public get ruleNames(): string[] { return CosmosScriptParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return CosmosScriptParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(CosmosScriptParser._ATN, this);
	}
	// @RuleVersion(0)
	public script(): ScriptContext {
		let _localctx: ScriptContext = new ScriptContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, CosmosScriptParser.RULE_script);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 15;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			do {
				{
				{
				this.state = 14;
				this.commandCall();
				}
				}
				this.state = 17;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			} while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CosmosScriptParser.CMD) | (1 << CosmosScriptParser.CMD_RAW) | (1 << CosmosScriptParser.TLM))) !== 0));
			this.state = 19;
			this.match(CosmosScriptParser.EOF);
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
	// @RuleVersion(0)
	public commandCall(): CommandCallContext {
		let _localctx: CommandCallContext = new CommandCallContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, CosmosScriptParser.RULE_commandCall);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 21;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CosmosScriptParser.CMD) | (1 << CosmosScriptParser.CMD_RAW) | (1 << CosmosScriptParser.TLM))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 22;
			this.match(CosmosScriptParser.OPEN_PAREN);
			this.state = 23;
			this.argumentList();
			this.state = 24;
			this.match(CosmosScriptParser.CLOSE_PAREN);
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
	// @RuleVersion(0)
	public argumentList(): ArgumentListContext {
		let _localctx: ArgumentListContext = new ArgumentListContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, CosmosScriptParser.RULE_argumentList);
		try {
			this.state = 28;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 1, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 26;
				this.stringArgList();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 27;
				this.commaSeparatedList();
				}
				break;
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
	// @RuleVersion(0)
	public stringArgList(): StringArgListContext {
		let _localctx: StringArgListContext = new StringArgListContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, CosmosScriptParser.RULE_stringArgList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 30;
			this.match(CosmosScriptParser.QUOTED_STRING);
			this.state = 33;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === CosmosScriptParser.WITH) {
				{
				this.state = 31;
				this.match(CosmosScriptParser.WITH);
				this.state = 32;
				this.parameterMapping();
				}
			}

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
	// @RuleVersion(0)
	public parameterMapping(): ParameterMappingContext {
		let _localctx: ParameterMappingContext = new ParameterMappingContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, CosmosScriptParser.RULE_parameterMapping);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 35;
			this.match(CosmosScriptParser.ID);
			this.state = 36;
			_la = this._input.LA(1);
			if (!(_la === CosmosScriptParser.QUOTED_STRING || _la === CosmosScriptParser.ID)) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			this.state = 41;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CosmosScriptParser.ID) {
				{
				{
				this.state = 37;
				this.match(CosmosScriptParser.ID);
				this.state = 38;
				_la = this._input.LA(1);
				if (!(_la === CosmosScriptParser.QUOTED_STRING || _la === CosmosScriptParser.ID)) {
				this._errHandler.recoverInline(this);
				} else {
					if (this._input.LA(1) === Token.EOF) {
						this.matchedEOF = true;
					}

					this._errHandler.reportMatch(this);
					this.consume();
				}
				}
				}
				this.state = 43;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
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
	// @RuleVersion(0)
	public commaSeparatedList(): CommaSeparatedListContext {
		let _localctx: CommaSeparatedListContext = new CommaSeparatedListContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, CosmosScriptParser.RULE_commaSeparatedList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 44;
			this.commandExpression();
			this.state = 49;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === CosmosScriptParser.COMMA) {
				{
				{
				this.state = 45;
				this.match(CosmosScriptParser.COMMA);
				this.state = 46;
				this.commandExpression();
				}
				}
				this.state = 51;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
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
	// @RuleVersion(0)
	public commandExpression(): CommandExpressionContext {
		let _localctx: CommandExpressionContext = new CommandExpressionContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, CosmosScriptParser.RULE_commandExpression);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 52;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << CosmosScriptParser.HASH_MAP) | (1 << CosmosScriptParser.QUOTED_STRING) | (1 << CosmosScriptParser.ID))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
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
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x109\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x03\x02\x06\x02\x12\n\x02\r\x02\x0E\x02\x13\x03\x02\x03" +
		"\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04\x03\x04\x05\x04\x1F" +
		"\n\x04\x03\x05\x03\x05\x03\x05\x05\x05$\n\x05\x03\x06\x03\x06\x03\x06" +
		"\x03\x06\x07\x06*\n\x06\f\x06\x0E\x06-\v\x06\x03\x07\x03\x07\x03\x07\x07" +
		"\x072\n\x07\f\x07\x0E\x075\v\x07\x03\b\x03\b\x03\b\x02\x02\x02\t\x02\x02" +
		"\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02\x02\x05\x03\x02\x04\x06\x03" +
		"\x02\x0E\x0F\x04\x02\x03\x03\x0E\x0F\x026\x02\x11\x03\x02\x02\x02\x04" +
		"\x17\x03\x02\x02\x02\x06\x1E\x03\x02\x02\x02\b \x03\x02\x02\x02\n%\x03" +
		"\x02\x02\x02\f.\x03\x02\x02\x02\x0E6\x03\x02\x02\x02\x10\x12\x05\x04\x03" +
		"\x02\x11\x10\x03\x02\x02\x02\x12\x13\x03\x02\x02\x02\x13\x11\x03\x02\x02" +
		"\x02\x13\x14\x03\x02\x02\x02\x14\x15\x03\x02\x02\x02\x15\x16\x07\x02\x02" +
		"\x03\x16\x03\x03\x02\x02\x02\x17\x18\t\x02\x02\x02\x18\x19\x07\b\x02\x02" +
		"\x19\x1A\x05\x06\x04\x02\x1A\x1B\x07\t\x02\x02\x1B\x05\x03\x02\x02\x02" +
		"\x1C\x1F\x05\b\x05\x02\x1D\x1F\x05\f\x07\x02\x1E\x1C\x03\x02\x02\x02\x1E" +
		"\x1D\x03\x02\x02\x02\x1F\x07\x03\x02\x02\x02 #\x07\x0E\x02\x02!\"\x07" +
		"\x07\x02\x02\"$\x05\n\x06\x02#!\x03\x02\x02\x02#$\x03\x02\x02\x02$\t\x03" +
		"\x02\x02\x02%&\x07\x0F\x02\x02&+\t\x03\x02\x02\'(\x07\x0F\x02\x02(*\t" +
		"\x03\x02\x02)\'\x03\x02\x02\x02*-\x03\x02\x02\x02+)\x03\x02\x02\x02+," +
		"\x03\x02\x02\x02,\v\x03\x02\x02\x02-+\x03\x02\x02\x02.3\x05\x0E\b\x02" +
		"/0\x07\n\x02\x0202\x05\x0E\b\x021/\x03\x02\x02\x0225\x03\x02\x02\x023" +
		"1\x03\x02\x02\x0234\x03\x02\x02\x024\r\x03\x02\x02\x0253\x03\x02\x02\x02" +
		"67\t\x04\x02\x027\x0F\x03\x02\x02\x02\x07\x13\x1E#+3";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CosmosScriptParser.__ATN) {
			CosmosScriptParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CosmosScriptParser._serializedATN));
		}

		return CosmosScriptParser.__ATN;
	}

}

export class ScriptContext extends ParserRuleContext {
	public EOF(): TerminalNode { return this.getToken(CosmosScriptParser.EOF, 0); }
	public commandCall(): CommandCallContext[];
	public commandCall(i: number): CommandCallContext;
	public commandCall(i?: number): CommandCallContext | CommandCallContext[] {
		if (i === undefined) {
			return this.getRuleContexts(CommandCallContext);
		} else {
			return this.getRuleContext(i, CommandCallContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CosmosScriptParser.RULE_script; }
	// @Override
	public enterRule(listener: CosmosScriptListener): void {
		if (listener.enterScript) {
			listener.enterScript(this);
		}
	}
	// @Override
	public exitRule(listener: CosmosScriptListener): void {
		if (listener.exitScript) {
			listener.exitScript(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CosmosScriptVisitor<Result>): Result {
		if (visitor.visitScript) {
			return visitor.visitScript(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CommandCallContext extends ParserRuleContext {
	public OPEN_PAREN(): TerminalNode { return this.getToken(CosmosScriptParser.OPEN_PAREN, 0); }
	public argumentList(): ArgumentListContext {
		return this.getRuleContext(0, ArgumentListContext);
	}
	public CLOSE_PAREN(): TerminalNode { return this.getToken(CosmosScriptParser.CLOSE_PAREN, 0); }
	public CMD(): TerminalNode | undefined { return this.tryGetToken(CosmosScriptParser.CMD, 0); }
	public CMD_RAW(): TerminalNode | undefined { return this.tryGetToken(CosmosScriptParser.CMD_RAW, 0); }
	public TLM(): TerminalNode | undefined { return this.tryGetToken(CosmosScriptParser.TLM, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CosmosScriptParser.RULE_commandCall; }
	// @Override
	public enterRule(listener: CosmosScriptListener): void {
		if (listener.enterCommandCall) {
			listener.enterCommandCall(this);
		}
	}
	// @Override
	public exitRule(listener: CosmosScriptListener): void {
		if (listener.exitCommandCall) {
			listener.exitCommandCall(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CosmosScriptVisitor<Result>): Result {
		if (visitor.visitCommandCall) {
			return visitor.visitCommandCall(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ArgumentListContext extends ParserRuleContext {
	public stringArgList(): StringArgListContext | undefined {
		return this.tryGetRuleContext(0, StringArgListContext);
	}
	public commaSeparatedList(): CommaSeparatedListContext | undefined {
		return this.tryGetRuleContext(0, CommaSeparatedListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CosmosScriptParser.RULE_argumentList; }
	// @Override
	public enterRule(listener: CosmosScriptListener): void {
		if (listener.enterArgumentList) {
			listener.enterArgumentList(this);
		}
	}
	// @Override
	public exitRule(listener: CosmosScriptListener): void {
		if (listener.exitArgumentList) {
			listener.exitArgumentList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CosmosScriptVisitor<Result>): Result {
		if (visitor.visitArgumentList) {
			return visitor.visitArgumentList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StringArgListContext extends ParserRuleContext {
	public QUOTED_STRING(): TerminalNode { return this.getToken(CosmosScriptParser.QUOTED_STRING, 0); }
	public WITH(): TerminalNode | undefined { return this.tryGetToken(CosmosScriptParser.WITH, 0); }
	public parameterMapping(): ParameterMappingContext | undefined {
		return this.tryGetRuleContext(0, ParameterMappingContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CosmosScriptParser.RULE_stringArgList; }
	// @Override
	public enterRule(listener: CosmosScriptListener): void {
		if (listener.enterStringArgList) {
			listener.enterStringArgList(this);
		}
	}
	// @Override
	public exitRule(listener: CosmosScriptListener): void {
		if (listener.exitStringArgList) {
			listener.exitStringArgList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CosmosScriptVisitor<Result>): Result {
		if (visitor.visitStringArgList) {
			return visitor.visitStringArgList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParameterMappingContext extends ParserRuleContext {
	public ID(): TerminalNode[];
	public ID(i: number): TerminalNode;
	public ID(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CosmosScriptParser.ID);
		} else {
			return this.getToken(CosmosScriptParser.ID, i);
		}
	}
	public QUOTED_STRING(): TerminalNode[];
	public QUOTED_STRING(i: number): TerminalNode;
	public QUOTED_STRING(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CosmosScriptParser.QUOTED_STRING);
		} else {
			return this.getToken(CosmosScriptParser.QUOTED_STRING, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CosmosScriptParser.RULE_parameterMapping; }
	// @Override
	public enterRule(listener: CosmosScriptListener): void {
		if (listener.enterParameterMapping) {
			listener.enterParameterMapping(this);
		}
	}
	// @Override
	public exitRule(listener: CosmosScriptListener): void {
		if (listener.exitParameterMapping) {
			listener.exitParameterMapping(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CosmosScriptVisitor<Result>): Result {
		if (visitor.visitParameterMapping) {
			return visitor.visitParameterMapping(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CommaSeparatedListContext extends ParserRuleContext {
	public commandExpression(): CommandExpressionContext[];
	public commandExpression(i: number): CommandExpressionContext;
	public commandExpression(i?: number): CommandExpressionContext | CommandExpressionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(CommandExpressionContext);
		} else {
			return this.getRuleContext(i, CommandExpressionContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(CosmosScriptParser.COMMA);
		} else {
			return this.getToken(CosmosScriptParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CosmosScriptParser.RULE_commaSeparatedList; }
	// @Override
	public enterRule(listener: CosmosScriptListener): void {
		if (listener.enterCommaSeparatedList) {
			listener.enterCommaSeparatedList(this);
		}
	}
	// @Override
	public exitRule(listener: CosmosScriptListener): void {
		if (listener.exitCommaSeparatedList) {
			listener.exitCommaSeparatedList(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CosmosScriptVisitor<Result>): Result {
		if (visitor.visitCommaSeparatedList) {
			return visitor.visitCommaSeparatedList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CommandExpressionContext extends ParserRuleContext {
	public QUOTED_STRING(): TerminalNode | undefined { return this.tryGetToken(CosmosScriptParser.QUOTED_STRING, 0); }
	public ID(): TerminalNode | undefined { return this.tryGetToken(CosmosScriptParser.ID, 0); }
	public HASH_MAP(): TerminalNode | undefined { return this.tryGetToken(CosmosScriptParser.HASH_MAP, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return CosmosScriptParser.RULE_commandExpression; }
	// @Override
	public enterRule(listener: CosmosScriptListener): void {
		if (listener.enterCommandExpression) {
			listener.enterCommandExpression(this);
		}
	}
	// @Override
	public exitRule(listener: CosmosScriptListener): void {
		if (listener.exitCommandExpression) {
			listener.exitCommandExpression(this);
		}
	}
	// @Override
	public accept<Result>(visitor: CosmosScriptVisitor<Result>): Result {
		if (visitor.visitCommandExpression) {
			return visitor.visitCommandExpression(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


