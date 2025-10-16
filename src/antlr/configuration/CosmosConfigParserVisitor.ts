// Generated from src/antlr/configuration/CosmosConfigParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { TestRuleContext } from "./CosmosConfigParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CosmosConfigParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface CosmosConfigParserVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `CosmosConfigParser.testRule`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitTestRule?: (ctx: TestRuleContext) => Result;
}

