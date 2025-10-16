// Generated from src/antlr/CosmosScript.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { ScriptContext } from "./CosmosScriptParser";
import { CommandCallContext } from "./CosmosScriptParser";
import { CmdArgumentListContext } from "./CosmosScriptParser";
import { CmdInlineArgListContext } from "./CosmosScriptParser";
import { ParameterMappingContext } from "./CosmosScriptParser";
import { CmdPositionalArgListContext } from "./CosmosScriptParser";
import { CommandExpressionContext } from "./CosmosScriptParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CosmosScriptParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface CosmosScriptVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `CosmosScriptParser.script`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitScript?: (ctx: ScriptContext) => Result;

	/**
	 * Visit a parse tree produced by `CosmosScriptParser.commandCall`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCommandCall?: (ctx: CommandCallContext) => Result;

	/**
	 * Visit a parse tree produced by `CosmosScriptParser.cmdArgumentList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCmdArgumentList?: (ctx: CmdArgumentListContext) => Result;

	/**
	 * Visit a parse tree produced by `CosmosScriptParser.cmdInlineArgList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCmdInlineArgList?: (ctx: CmdInlineArgListContext) => Result;

	/**
	 * Visit a parse tree produced by `CosmosScriptParser.parameterMapping`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitParameterMapping?: (ctx: ParameterMappingContext) => Result;

	/**
	 * Visit a parse tree produced by `CosmosScriptParser.cmdPositionalArgList`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCmdPositionalArgList?: (ctx: CmdPositionalArgListContext) => Result;

	/**
	 * Visit a parse tree produced by `CosmosScriptParser.commandExpression`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCommandExpression?: (ctx: CommandExpressionContext) => Result;
}

