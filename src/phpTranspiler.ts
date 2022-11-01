import { BaseTranspiler } from "./pureAst.js";
import ts from 'typescript';

const SyntaxKind = ts.SyntaxKind;

const parserConfig = {
    'ELSEIF_TOKEN': 'elseif',
    'THIS_TOKEN': '$this',
    'AMPERSTAND_APERSAND_TOKEN': '&&',
    'BAR_BAR_TOKEN': '||',
    'TRUE_KEYWORD': 'true',
    'FALSE_KEYWORD': 'false',
    'PROPERTY_ACCESS_TOKEN': '->',
    'UNDEFINED_TOKEN': 'null',
    'IF_COND_CLOSE': ')',
    'IF_COND_OPEN': '(',
    'IF_OPEN': '{',
    'IF_CLOSE': '}',
    'NOT_TOKEN': '!',
    'ELSE_OPEN_TOKEN': ' {',
    'ELSE_CLOSE_TOKEN': '}',
    'LINE_TERMINATOR': ';',
    'LEFT_ARRAY_OPENING':"array(",
    'RIGHT_ARRAY_CLOSING':")",
    'OBJECT_OPENING':"array(",
    'OBJECT_CLOSING':")",
    'FUNCTION_TOKEN': 'function',
    'FUNCTION_DEF_OPEN': '{',
    'FUNCTION_CLOSE': '}',
    'ASYNC_TOKEN': '',
    'WHILE_COND_OPEN' : "(",
    'WHILE_COND_CLOSE' : ")",
    'WHILE_CLOSE': "}",
    'WHILE_OPEN': "{",
    'PROPERTY_ASSIGNMENT_TOKEN': ' =>',
    'NEW_TOKEN': 'new',
    'THROW_TOKEN': 'throw',
    'SUPER_TOKEN': 'parent'
}

export class PhpTranspiler extends BaseTranspiler {
    asyncTranspiling;
    awaitWrapper;
    constructor(config = {}) {
        super(parserConfig);
        
        this.asyncTranspiling = config['async'] ?? true;

        this.awaitWrapper = "Async\\await";
        this.initConfig();
    }

    printAwaitExpression(node, identation) {
        const expression = this.printNode(node.expression, 0);

        if (!this.asyncTranspiling) {
            return this.getIden(identation) + expression;
        }

        return this.getIden(identation) + this.awaitWrapper + "(" + expression + ")" ;
    }

    transformIdentifier(identifier) {
        return "$" + identifier;
    }

    getCustomOperatorIfAny(left, right, operator) {
        const CONCAT_TOKEN = '.';
        if (operator.kind == SyntaxKind.PlusToken) {
            if (left.kind == SyntaxKind.StringLiteral || right.kind == SyntaxKind.StringLiteral) {
                return CONCAT_TOKEN;
            }
            
            const leftType = global.checker.getTypeAtLocation(left);
            const rightType = global.checker.getTypeAtLocation(right);
            
            if (leftType.flags === ts.TypeFlags.String || rightType.flags === ts.TypeFlags.String) {
                return CONCAT_TOKEN;
            }
            if (leftType.flags === ts.TypeFlags.StringLiteral || rightType.flags === ts.TypeFlags.StringLiteral) {
                return CONCAT_TOKEN;
            }
        }
        return undefined;
    }

    transformPropertyAcessExpressionIfNeeded(node: any) {
        const expression = node.expression;
        let leftSide = this.printNode(expression, 0);
        let rightSide = node.name.escapedText;
        
        let rawExpression = undefined;

        switch(rightSide) {
            case 'length':
                rawExpression =  "len(" + leftSide + ")";
                break;
            case 'toString':
                rawExpression = "(string) " + leftSide;
                break;
            case 'toUpperCase':
                rawExpression = "strtoupper(" + leftSide + ")";
                break;
            case 'toLowerCase':
                rawExpression = "strtolower(" + leftSide + ")";
                break;
            case 'shift':
                rawExpression = "array_shift(" + leftSide + ")";
            case 'pop':
                rawExpression = "array_pop(" + leftSide + ")";
                break;
        }

        // if (rightSide === "length") {
        //     rawExpression =  "len(" + leftSide + ")";
        // } else if (rightSide === "toString") {
        //     rawExpression = "str(" + leftSide + ")";
        // }
        return rawExpression;
    }

    printOutOfOrderCallExpressionIfAny(node, identation) {
        const expressionText = node.expression.getText();
        const args = node.arguments;
        let finalExpression = undefined;
        switch (expressionText) {
            case "JSON.parse":
                finalExpression = "json_decode(" + this.printNode(args[0], 0) + ",$as_associative_array = true)";
                break;
        }
        if (finalExpression) {
            return this.getIden(identation) + finalExpression;
        }
        return undefined
    }


    initConfig() {
        this.LeftPropertyAccessReplacements = {
            'this': '$this',
        }

        this.RightPropertyAccessReplacements = {

        }

        this.FullPropertyAccessReplacements = {
            'Number.MAX_SAFE_INTEGER': 'PHP_INT_MAX',
            'JSON.stringify': 'json_encode',
            'console.log': 'var_dump',
            'process.exit': 'exit',
            'Math.log': 'log',
            'Math.abs': 'abs',
            'Math.floor': '(int) floor',
            'Math.ceil': '(int) ceil',
            'Math.round': '(int) round',
            'Math.pow': 'pow',
            'Math.min': 'min',
            'Math.max': 'max',
        }

        this.CallExpressionReplacements = {
            'parseFloat': 'floatval',
            'parseInt': 'intval',
        }
    }

}