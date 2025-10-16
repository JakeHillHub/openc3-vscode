// Generated from src/antlr/configuration/CosmosConfigParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { TestRuleContext } from "./CosmosConfigParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `CosmosConfigParser`.
 */
export interface CosmosConfigParserListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `CosmosConfigParser.testRule`.
	 * @param ctx the parse tree
	 */
	enterTestRule?: (ctx: TestRuleContext) => void;
	/**
	 * Exit a parse tree produced by `CosmosConfigParser.testRule`.
	 * @param ctx the parse tree
	 */
	exitTestRule?: (ctx: TestRuleContext) => void;
}

