import { BaseTranspiler } from "./BaseTranspiler.js";
import { regexAll } from "./utils.js";
import ts from 'typescript';

const SyntaxKind = ts.SyntaxKind;

const parserConfig = {
    'STATIC_TOKEN': '', // to do static decorator
    'PUBLIC_KEYWORD': '',
    'UNDEFINED_TOKEN': 'None',
    'IF_TOKEN': 'if',
    'ELSE_TOKEN': 'else',
    'ELSEIF_TOKEN': 'elif',
    'THIS_TOKEN': 'self',
    'AMPERSTAND_APERSAND_TOKEN': 'and',
    'BAR_BAR_TOKEN': 'or',
    'SPACE_DEFAULT_PARAM': '',
    'BLOCK_OPENING_TOKEN': ':',
    'BLOCK_CLOSING_TOKEN': '',
    'SPACE_BEFORE_BLOCK_OPENING': '',
    'CONDITION_OPENING': '',
    'CONDITION_CLOSE': '',
    'TRUE_KEYWORD': 'True',
    'FALSE_KEYWORD': 'False',
    'THROW_TOKEN': 'raise',
    'NOT_TOKEN': 'not ',
    'PLUS_PLUS_TOKEN': ' += 1',
    'MINUS_MINUS_TOKEN': ' -= 1',
    'CONSTRUCTOR_TOKEN': 'def __init__',
    'SUPER_CALL_TOKEN': 'super().__init__',
    'PROPERTY_ASSIGNMENT_TOKEN': ':',
    'FUNCTION_TOKEN': 'def',
    'SUPER_TOKEN': 'super()',
    'NEW_TOKEN': '',
    'STRING_QUOTE_TOKEN': '\'',
    'LINE_TERMINATOR': '',
    'METHOD_TOKEN': 'def',
    'CATCH_TOKEN': 'except',
    'CATCH_DECLARATION': 'Exception as'
};
export class PythonTranspiler extends BaseTranspiler {
    constructor(config = {}) {
        
        config['parser'] = Object.assign ({}, parserConfig, config['parser'] ?? {});

        super(config);
        
        this.initConfig();
        this.asyncTranspiling = config['async'] ?? true;
        this.uncamelcaseIdentifiers = config['uncamelcaseIdentifiers'] ?? false;

        // user overrides
        this.applyUserOverrides(config);
    }

    initConfig() {
        this.LeftPropertyAccessReplacements = {
            'this': 'self'
        };
        this.RightPropertyAccessReplacements = {
            'push': 'append',
            'toUpperCase': 'upper',
            'toLowerCase': 'lower',
            // 'parseFloat': 'float',
            // 'parseInt': 'int',
            'indexOf': 'find',
            'padEnd': 'ljust',
            'padStart': 'rjust'
        };
        this.FullPropertyAccessReplacements = {
            'console.log': 'print',
            'JSON.stringify': 'json.dumps',
            'JSON.parse': 'json.loads',
            'Math.log': 'math.log',
            'Math.abs': 'abs',
            'Math.min': 'min',
            'Math.max': 'max',
            'Math.ceil': 'math.ceil',
            'Math.round': 'math.round',
            'Math.floor': 'math.floor',
            'Math.pow': 'math.pow',
            'process.exit': 'sys.exit',
            'Number.MAX_SAFE_INTEGER': 'float(\'inf\')',
        };
        this.CallExpressionReplacements = {
            'parseInt': 'int',
            'parseFloat': 'float',
        };

        this.PropertyAccessRequiresParenthesisRemoval = [
            'length',
            'toString',
        ];
    }

    printOutOfOrderCallExpressionIfAny(node, identation) {
        const expressionText = node.expression.getText();
        const args = node.arguments;
        let finalExpression = undefined;
        switch (expressionText) {
            case "Array.isArray":
                finalExpression = "isinstance(" + this.printNode(args[0], 0) + ", list)";
                break;
            case "Math.floor":
                finalExpression = "int(math.floor(" + this.printNode(args[0], 0) + "))";
                break;
            case "Object.keys":
                finalExpression = "list(" + this.printNode(args[0], 0) + ".keys())";
                break;
            case "Object.values":
                finalExpression = "list(" + this.printNode(args[0], 0) + ".values())";
                break;
            case "Math.round":
                finalExpression = "int(round(" + this.printNode(args[0], 0) + "))";
                break;
            case "Math.ceil":
                finalExpression = "int(math.ceil(" + this.printNode(args[0], 0) + "))";
                break;
            case "Promise.all":
                finalExpression = "asyncio.gather(*" + this.printNode(args[0], 0) + ")";
                break;
        }
        if (finalExpression) {
            return this.getIden(identation) + finalExpression;
        }

        const letfSide = node.expression.expression;
        const rightSide = node.expression.name?.escapedText;

        if (rightSide === "shift") {
            return this.getIden(identation) + this.printNode(letfSide, 0) + ".pop(0)";
        }

        const arg = args && args.length > 0 ? args[0] : undefined;
        
        if (letfSide && arg) {
            const argText = this.printNode(arg, 0);
            const leftSideText = this.printNode(letfSide, 0);
            switch (rightSide) {
                case 'includes':
                    return this.getIden(identation) + argText + " in " + leftSideText;
                case 'join':
                    return this.getIden(identation) + argText + ".join(" + leftSideText + ")";
                case 'split':
                    return this.getIden(identation) + leftSideText + ".split(" + argText + ")";
            }
        }

        return undefined;
    }

    printElementAccessExpressionExceptionIfAny(node) {
        if (node.expression.kind === SyntaxKind.ThisKeyword) {
            return "getattr(self, " + this.printNode(node.argumentExpression, 0) + ")";
        }
    }

    printForStatement(node, identation) {
        const varName = node.initializer.declarations[0].name.escapedText; 
        const initValue = this.printNode(node.initializer.declarations[0].initializer, 0);
        const roofValue = this.printNode(node.condition.right,0);

        const forStm =  this.getIden(identation) + this.FOR_TOKEN +  " " + varName + " in range(" + initValue + ", " + roofValue + "):\n" + node.statement.statements.map(st => this.printNode(st, identation+1)).join("\n");
        return this.printNodeCommentsIfAny(node, identation, forStm);
    }

    transformLeadingComment(comment) {
        const commentRegex = [
                [ /(^|\s)\/\//g, '$1#' ], // regular comments
                [ /\/\*\*/, '\"\"\"' ], // eslint-disable-line
                [ / \*\//, '\"\"\"' ], // eslint-disable-line
                [ /\[([^\[\]]*)\]\{@link (.*)\}/g, '`$1 <$2>`' ], // eslint-disable-line
                [ /\s+\* @method/g, '' ], // docstring @method
                [ /(\s+) \* @description (.*)/g, '$1$2' ], // docstring description
                [ /\s+\* @name .*/g, '' ], // docstring @name
                [ /(\s+) \* @see( .*)/g, '$1see$2' ], // docstring @see
                [ /(\s+ \* @(param|returns) {[^}]*)string([^}]*}.*)/g, '$1str$3' ], // docstring type conversion
                [ /(\s+ \* @(param|returns) {[^}]*)object([^}]*}.*)/g, '$1dict$3' ], // doctstrubg type conversion
                [ /(\s+) \* @returns ([^\{])/g, '$1:returns: $2' ], // eslint-disable-line
                [ /(\s+) \* @returns \{(.+)\}/g, '$1:returns $2:' ], // docstring return
                [ /(\s+ \* @param \{[\]\[\|a-zA-Z]+\} )([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+) (.*)/g, '$1$2[\'$3\'] $4' ], // eslint-disable-line
                [ /(\s+) \* @([a-z]+) \{([\]\[a-zA-Z\|]+)\} ([a-zA-Z0-9_\-\.\[\]\']+)/g, '$1:$2 $3 $4:' ],  // eslint-disable-line
            ];

        const transformed = regexAll(comment, commentRegex);
        return transformed;
    }

    transformTrailingComment(comment) {
        const commentRegex = [
                [ /(^|\s)\/\//g, '$1#' ], // regular comments
            ];

        const transformed = regexAll(comment, commentRegex);
        return " " + transformed;
    }

    transformPropertyAcessExpressionIfNeeded(node: any) {
        const expression = node.expression;
        const leftSide = this.printNode(expression, 0);
        const rightSide = node.name.escapedText;
        
        let rawExpression = undefined;

        if (rightSide === "length") {
            rawExpression =  "len(" + leftSide + ")";
        } else if (rightSide === "toString") {
            rawExpression = "str(" + leftSide + ")";
        }
        return rawExpression;
    }

    printClassDefinition(node: any, identation: any): string {
        const className = node.name.escapedText;
        const heritageClauses = node.heritageClauses;

        let classInit = "";
        if (heritageClauses !== undefined) {
            const classExtends = heritageClauses[0].types[0].expression.escapedText;
            classInit = this.getIden(identation) + "class " + className + "(" + classExtends + "):\n";
        } else {
            classInit = this.getIden(identation) + "class " + className + ":\n";
        }
        return classInit;
    }

    printMethodParameters(node) {
        let parsedArgs = super.printMethodParameters(node);
        parsedArgs = parsedArgs ? "self, " + parsedArgs : "self";
        return parsedArgs;
    }

    printInstanceOfExpression(node, identation) {
        const left = this.printNode(node.left, 0);
        const right = this.printNode(node.right, 0);
        return this.getIden(identation) + `isinstance(${left}, ${right})`;
    }

    handleTypeOfInsideBinaryExpression(node, identation) {
        const expression = node.left.expression;
        const right = node.right.text;

        const op = node.operatorToken.kind;
        const isDifferentOperator = op === SyntaxKind.ExclamationEqualsEqualsToken || op === SyntaxKind.ExclamationEqualsToken;
        const notOperator = isDifferentOperator ? this.NOT_TOKEN : "";

        switch (right) {
            case "string":
                return this.getIden(identation) + notOperator + "isinstance(" + this.printNode(expression, 0) + ", str)";
            case "number":
                return this.getIden(identation) + notOperator + "isinstance(" + this.printNode(expression, 0) + ", numbers.Real)";
            case "boolean":
                return this.getIden(identation) + notOperator + "isinstance(" + this.printNode(expression, 0) + ", bool)";
            case "object":
                return this.getIden(identation) + notOperator + "isinstance(" + this.printNode(expression, 0) + ", dict)";
        }

        return undefined;

    }
    
    printCustomBinaryExpressionIfAny(node, identation) {
        const left = node.left;
        const right = node.right.text;

        const op = node.operatorToken.kind;

        if (left.kind === SyntaxKind.TypeOfExpression) {
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
            // const rightType = global.checker.getTypeAtLocation(leftSideOfIndexOf); // type of myString in myString.indexOf ("b") >= 0;

            switch(prop) {
                case 'indexOf':
                    if (op === SyntaxKind.GreaterThanEqualsToken && right === '0') {
                        return this.getIden(identation) + `${parsedArg} in ${leftSide}`;
                    }
            }
        }
        return undefined;
    }

    printConditionalExpression(node, identation) {
        const condition = this.printNode(node.condition, 0);
        const whenTrue = this.printNode(node.whenTrue, 0);
        const whenFalse = this.printNode(node.whenFalse, 0);

        return this.getIden(identation) + whenTrue + " if " + condition + " else " + whenFalse;
    }

    getCustomOperatorIfAny(left, right, operator) {
        const rightText = right.getText();
        const isUndefined = rightText === "undefined";
        if (isUndefined) {
            switch (operator.kind) {
                case ts.SyntaxKind.EqualsEqualsToken:
                    return "is";
                case ts.SyntaxKind.ExclamationEqualsToken:
                    return "is not";
                case ts.SyntaxKind.ExclamationEqualsEqualsToken:
                    return "is not";
                case ts.SyntaxKind.EqualsEqualsEqualsToken:
                    return "is";
            }
        }
    }
}
