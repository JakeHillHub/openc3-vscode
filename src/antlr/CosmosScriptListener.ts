// Generated from src/antlr/CosmosScript.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { ScriptContext } from "./CosmosScriptParser";
import { CommandCallContext } from "./CosmosScriptParser";
import { CmdArgumentListContext } from "./CosmosScriptParser";
import { CmdInlineArgListContext } from "./CosmosScriptParser";
import { ParameterMappingContext } from "./CosmosScriptParser";
import { CmdPositionalArgListContext } from "./CosmosScriptParser";
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
	 * Enter a parse tree produced by `CosmosScriptParser.cmdArgumentList`.
	 * @param ctx the parse tree
	 */
	enterCmdArgumentList?: (ctx: CmdArgumentListContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.cmdArgumentList`.
	 * @param ctx the parse tree
	 */
	exitCmdArgumentList?: (ctx: CmdArgumentListContext) => void;

	/**
	 * Enter a parse tree produced by `CosmosScriptParser.cmdInlineArgList`.
	 * @param ctx the parse tree
	 */
	enterCmdInlineArgList?: (ctx: CmdInlineArgListContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.cmdInlineArgList`.
	 * @param ctx the parse tree
	 */
	exitCmdInlineArgList?: (ctx: CmdInlineArgListContext) => void;

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
	 * Enter a parse tree produced by `CosmosScriptParser.cmdPositionalArgList`.
	 * @param ctx the parse tree
	 */
	enterCmdPositionalArgList?: (ctx: CmdPositionalArgListContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosScriptParser.cmdPositionalArgList`.
	 * @param ctx the parse tree
	 */
	exitCmdPositionalArgList?: (ctx: CmdPositionalArgListContext) => void;

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

