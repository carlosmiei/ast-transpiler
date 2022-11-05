import { BaseTranspiler } from "./pureAst.js";
import ts, { TypeChecker } from 'typescript';
import { unCamelCase } from "./utils.js";

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
    'LEFT_ARRAY_OPENING':"[",
    'RIGHT_ARRAY_CLOSING':"]",
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
    'SUPER_TOKEN': 'parent',
};

export class PhpTranspiler extends BaseTranspiler {
    asyncTranspiling;
    awaitWrapper;
    propRequiresScopeResolutionOperator: string[];
    uncamelcaseIdentifiers: boolean;
    constructor(config = {}) {
        super(parserConfig);
        
        this.asyncTranspiling = config['async'] ?? true;
        this.uncamelcaseIdentifiers = config['uncamelcaseIdentifiers'] ?? false;

        this.propRequiresScopeResolutionOperator = ['super'] + (config['scopeResolutionProps'] ?? []);

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

        if (this.uncamelcaseIdentifiers) {
            identifier = unCamelCase(identifier) ?? identifier;
        }
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
        const leftSide = this.printNode(expression, 0);
        const rightSide = node.name.escapedText;
        
        let rawExpression = undefined;

        switch(rightSide) {
            case 'length':
                const type = (global.checker as TypeChecker).getTypeAtLocation(expression); // eslint-disable-line
                rawExpression = this.isStringType(type.flags) ? "strlen(" + leftSide + ")" : "count(" + leftSide + ")";
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
                break;
            case 'pop':
                rawExpression = "array_pop(" + leftSide + ")";
                break;
        }

        return rawExpression;
    }

    printOutOfOrderCallExpressionIfAny(node, identation) {
        if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const expressionText = node.expression.getText().trim();
            const args = node.arguments;
            switch (expressionText) {
                case "JSON.parse":
                    return "json_decode(" + this.printNode(args[0], 0) + ",$as_associative_array = true)";
            }
    
            const leftSide = node.expression?.expression;
            const rightSide = node.expression.name?.escapedText;
    
            const arg = args && args.length > 0 ? args[0] : undefined;
            
            if (arg) {
                const argText = this.printNode(arg, 0);
                const leftSideText = this.printNode(leftSide, 0);
                switch (rightSide) {
                    case 'push':
                        return this.getIden(identation) + leftSideText + "[] = " + argText;
                    case 'includes':
                        const type = global.checker.getTypeAtLocation(leftSide); // eslint-disable-line
                        if (this.isStringType(type.flags)) {
                            return this.getIden(identation) + "str_contains(" + leftSideText + ", " + argText + ")";
                        } else {
                            return this.getIden(identation) + "in_array(" + argText + ", " + leftSideText + ")";
                        }
                }
            }
        }
        return undefined;
    }
    
    shouldRemoveParenthesisFromCallExpression(node) {

        if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propertyAccessExpression = node.expression;
            const propertyAccessExpressionName = propertyAccessExpression.name.text;
            switch (propertyAccessExpressionName) {
                case 'length':
                    return true;
                case 'toString':
                    return true;
                case 'toUpperCase':
                    return true;
                case 'toLowerCase':
                    return true;
                case 'pop':
                    return true;
                case 'shift':
                    return true;
            }
        }
        return false;
    }

    getExceptionalAccessTokenIfAny(node) {
        const leftSide = node.expression.escapedText ?? node.expression.getFullText().trim();

        if (!leftSide) {
            return undefined;
        }

        if (this.propRequiresScopeResolutionOperator.includes(leftSide)) {
            return "::";
        }
        return undefined;
    }

    printConditionalExpression(node, identation) {
        const condition = this.printNode(node.condition, 0);
        const whenTrue = this.printNode(node.whenTrue, 0);
        const whenFalse = this.printNode(node.whenFalse, 0);
        
        return this.getIden(identation) + condition + " ? " + whenTrue + " : " + whenFalse;
    }


    handleTypeOfInsideBinaryExpression(node, identation) {
        const left = node.left;
        const right = node.right.text;
        const op = node.operatorToken.kind;
        const expression = left.expression;

        const isDifferentOperator = op === SyntaxKind.ExclamationEqualsEqualsToken || op === SyntaxKind.ExclamationEqualsToken;
        const notOperator = isDifferentOperator ? this.NOT_TOKEN : "";

        switch (right) {
            case "string":
                return this.getIden(identation) + notOperator + "is_string(" + this.printNode(expression, 0) + ")";
            case "number":
                return this.getIden(identation) + notOperator + "(is_int(" + this.printNode(expression, 0) + ") || is_float(" + this.printNode(expression, 0) + "))";
            case "boolean":
                return this.getIden(identation) + notOperator + "is_bool(" + this.printNode(expression, 0) + ")";
            case "object":
                return this.getIden(identation) + notOperator + "is_array(" + this.printNode(expression, 0) + ")";
        }

        return undefined;

    }

    printCustomBinaryExpressionIfAny(node, identation) {
        const left = node.left;
        const right = node.right.text;

        const op = node.operatorToken.kind;

        if (left.kind === SyntaxKind.TypeOfExpression) {
            // handle typeof operator
            // Example: typeof a === "string"
            const typeOfExpression = this.handleTypeOfInsideBinaryExpression(node, identation);
            if (typeOfExpression) {
                return typeOfExpression;
            }
        }

        const prop = node?.left?.expression?.name?.text;

        if (prop) {
            const args = left.arguments;
            const parsedArg =  (args && args.length > 0) ? this.printNode(args[0], 0): undefined;
            const leftSideOfIndexOf = left.expression.expression;  // myString in myString.indexOf
            const leftSide = this.printNode(leftSideOfIndexOf, 0);
            const rightType = global.checker.getTypeAtLocation(leftSideOfIndexOf); // type of myString in myString.indexOf ("b") >= 0;
            switch(prop) {
                case 'indexOf':
                    if (op === SyntaxKind.GreaterThanEqualsToken && right === '0') {
                        if (this.isStringType(rightType.flags)) {
                            return this.getIden(identation) + "mb_strpos(" + leftSide + ", " + parsedArg + ") !== false";
                        } else {
                            return this.getIden(identation) + "in_array(" + parsedArg + ", " + leftSide + ")";
                        }
                    }
            }
        }
        return undefined;
    }

    transformMethodNameIfNeeded(name) {
        if (this.uncamelcaseIdentifiers) {
            return unCamelCase(name);
        }
        return undefined;
    }

    transformFunctionNameIfNeeded(name) {
        if (this.uncamelcaseIdentifiers) {
            return unCamelCase(name);
        }
        return undefined;
    }

    initConfig() {
        this.LeftPropertyAccessReplacements = {
            'this': '$this',
            // custom should be passed as config
            'Precise': 'Precise',
        };

        this.RightPropertyAccessReplacements = {

        };

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
        };

        this.CallExpressionReplacements = {
            'parseFloat': 'floatval',
            'parseInt': 'intval',
        };
    }

}