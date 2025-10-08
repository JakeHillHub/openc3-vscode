// Generated from src/antlr/CosmosScript.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { ScriptContext } from "./CosmosScriptParser";
import { CommandCallContext } from "./CosmosScriptParser";
import { ArgumentListContext } from "./CosmosScriptParser";
import { StringArgListContext } from "./CosmosScriptParser";
import { ParameterMappingContext } from "./CosmosScriptParser";
import { CommaSeparatedListContext } from "./CosmosScriptParser";
import { CommandExpressionContext } from "./CosmosScriptParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `CosmosScriptParser`.
 */
export interface CosmosScriptListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `CosmosScriptParser.script`.
	 * @param ctx the parse tree
	 */
	enterScript?: (ctx: ScriptContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.script`.
	 * @param ctx the parse tree
	 */
	exitScript?: (ctx: ScriptContext) => void;

	/**
	 * Enter a parse tree produced by `CosmosScriptParser.commandCall`.
	 * @param ctx the parse tree
	 */
	enterCommandCall?: (ctx: CommandCallContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.commandCall`.
	 * @param ctx the parse tree
	 */
	exitCommandCall?: (ctx: CommandCallContext) => void;

	/**
	 * Enter a parse tree produced by `CosmosScriptParser.argumentList`.
	 * @param ctx the parse tree
	 */
	enterArgumentList?: (ctx: ArgumentListContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.argumentList`.
	 * @param ctx the parse tree
	 */
	exitArgumentList?: (ctx: ArgumentListContext) => void;

	/**
	 * Enter a parse tree produced by `CosmosScriptParser.stringArgList`.
	 * @param ctx the parse tree
	 */
	enterStringArgList?: (ctx: StringArgListContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.stringArgList`.
	 * @param ctx the parse tree
	 */
	exitStringArgList?: (ctx: StringArgListContext) => void;

	/**
	 * Enter a parse tree produced by `CosmosScriptParser.parameterMapping`.
	 * @param ctx the parse tree
	 */
	enterParameterMapping?: (ctx: ParameterMappingContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.parameterMapping`.
	 * @param ctx the parse tree
	 */
	exitParameterMapping?: (ctx: ParameterMappingContext) => void;

	/**
	 * Enter a parse tree produced by `CosmosScriptParser.commaSeparatedList`.
	 * @param ctx the parse tree
	 */
	enterCommaSeparatedList?: (ctx: CommaSeparatedListContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.commaSeparatedList`.
	 * @param ctx the parse tree
	 */
	exitCommaSeparatedList?: (ctx: CommaSeparatedListContext) => void;

	/**
	 * Enter a parse tree produced by `CosmosScriptParser.commandExpression`.
	 * @param ctx the parse tree
	 */
	enterCommandExpression?: (ctx: CommandExpressionContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.commandExpression`.
	 * @param ctx the parse tree
	 */
	exitCommandExpression?: (ctx: CommandExpressionContext) => void;
}

