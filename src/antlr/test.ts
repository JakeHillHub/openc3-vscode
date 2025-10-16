import { CosmosConfigLexer } from './configuration/CosmosConfigLexer';
import { CosmosConfigParser, TestRuleContext } from './configuration/CosmosConfigParser';
import { CosmosConfigParserListener } from './configuration/CosmosConfigParserListener';
import { CharStreams, CommonTokenStream } from 'antlr4ts';
import { ParseTreeWalker } from 'antlr4ts/tree/ParseTreeWalker';

const chars = 'OG     ';
const inputStream = CharStreams.fromString(chars);
const lexer = new CosmosConfigLexer(inputStream);
const tokenStream = new CommonTokenStream(lexer);
const parser = new CosmosConfigParser(tokenStream);

class ListenerThing implements CosmosConfigParserListener {
  enterTestRule(ctx: TestRuleContext) {
    console.log(`Test rule ${ctx}`);
  }
}

const listener: CosmosConfigParserListener = new ListenerThing();
const tree = parser.testRule();
ParseTreeWalker.DEFAULT.walk(listener, tree);
