import { BaseTranspiler } from "./BaseTranspiler.js";
import ts, { TypeChecker } from 'typescript';
import { unCamelCase, regexAll } from "./utils.js";

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
    'ARRAY_OPENING_TOKEN':"[",
    'ARRAY_CLOSING_TOKEN':"]",
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
    'CLASS_CLOSING_TOKEN': '}',
    'CLASS_OPENING_TOKEN': '{',
    'CONSTRUCTOR_TOKEN': 'function __construct',
    'SUPER_CALL_TOKEN': 'parent::__construct',
    'CATCH_DECLARATION': 'Exception',
    'CATCH_OPEN': '{',
    'CATCH_CLOSE': '}',
    'TRY_OPEN': '{',
    'TRY_CLOSE': '}',
    'CATCH_COND_OPEN': '(',
    'CATCH_COND_CLOSE': ')',
    'CATCH_TOKEN': 'catch',
    'BLOCK_OPENING_TOKEN' :'{',
    'BLOCK_CLOSING_TOKEN' :'}',
    'SPACE_BEFORE_BLOCK_OPENING' :' ',
    'CONDITION_OPENING' :'(',
    'CONDITION_CLOSE' :')',
    'PLUS_PLUS_TOKEN': '++',
    'MINUS_MINUS_TOKEN': '--',
    'SPACE_DEFAULT_PARAM': ' ',
    'EXCLAMATION_EQUALS_EQUALS_TOKEN': '!==',
    'EQUALS_EQUALS_EQUALS_TOKEN': '==='
};

export class PhpTranspiler extends BaseTranspiler {
    awaitWrapper;
    propRequiresScopeResolutionOperator: string[];
    AWAIT_WRAPPER_OPEN;
    AWAIT_WRAPPER_CLOSE;
    ASYNC_FUNCTION_WRAPPER_OPEN = "";
    constructor(config = {}) {
        
        config['parser'] = Object.assign ({}, parserConfig, config['parser'] ?? {});
        
        super(config);
        
        this.asyncTranspiling = config['async'] ?? true;
        this.uncamelcaseIdentifiers = config['uncamelcaseIdentifiers'] ?? false;

        this.propRequiresScopeResolutionOperator = ['super'] + (config['ScopeResolutionProps'] ?? []);

        this.initConfig();

        // user overrides
        this.applyUserOverrides(config);

        // const propertyAccessRemoval = config['PropertyAccessRequiresParenthesisRemoval'] ?? [];
        // this.PropertyAccessRequiresParenthesisRemoval.push(...propertyAccessRemoval);

        this.AWAIT_WRAPPER_OPEN = config['AWAIT_WRAPPER_OPEN'] ?? "Async\\await(";
        this.AWAIT_WRAPPER_CLOSE = config['AWAIT_WRAPPER_CLOSE'] ??  ")";
    }

    printAwaitExpression(node, identation) {
        const expression = this.printNode(node.expression, 0);

        if (!this.asyncTranspiling) {
            return this.getIden(identation) + expression;
        }

        return this.getIden(identation) + this.AWAIT_WRAPPER_OPEN + expression + this.AWAIT_WRAPPER_CLOSE;
    }

    transformIdentifier(identifier) {

        if (this.uncamelcaseIdentifiers) {
            identifier = unCamelCase(identifier) ?? identifier;
        }
        return "$" + identifier;
    }

    getCustomOperatorIfAny(left, right, operator) {
        const STRING_CONCAT = '.';
        const PLUS_EQUALS_TOKEN = '.=';
        if (operator.kind == SyntaxKind.PlusToken || operator.kind == SyntaxKind.PlusEqualsToken) {

            const TOKEN = operator.kind == SyntaxKind.PlusToken ? STRING_CONCAT : PLUS_EQUALS_TOKEN;

            if (left.kind == SyntaxKind.StringLiteral || right.kind == SyntaxKind.StringLiteral) {
                return TOKEN;
            }
            
            const leftType = global.checker.getTypeAtLocation(left);
            const rightType = global.checker.getTypeAtLocation(right);
            
            if (leftType.flags === ts.TypeFlags.String || rightType.flags === ts.TypeFlags.String) {
                return TOKEN;
            }
            if (leftType.flags === ts.TypeFlags.StringLiteral || rightType.flags === ts.TypeFlags.StringLiteral) {
                return TOKEN;
            }
        }
        return undefined;
    }

    transformPropertyAcessExpressionIfNeeded(node) {
        const expression = node.expression;
        const leftSide = this.printNode(expression, 0);
        const rightSide = node.name.escapedText;
        
        let rawExpression = undefined;

        switch(rightSide) {
            case 'length':
                const type = (global.checker as TypeChecker).getTypeAtLocation(expression); // eslint-disable-line
                rawExpression = this.isStringType(type.flags) ? "strlen(" + leftSide + ")" : "count(" + leftSide + ")";
                break;
        }
        return rawExpression;
    }

    transformPropertyInsideCallExpressionIfNeeded(node: any) {
        const expression = node.expression;
        const leftSide = this.printNode(expression, 0);
        const rightSide = node.name.escapedText;
        
        let rawExpression = undefined;

        switch(rightSide) {
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
            if (args.length === 1) {
                const parsedArg = this.printNode(args[0], 0);
                switch (expressionText) {
                    case "JSON.parse":
                        return `json_decode(${parsedArg}, $as_associative_array = true)`;
                    case "Array.isArray":
                        return `gettype(${parsedArg}) === 'array' && array_keys(${parsedArg}) === array_keys(array_keys(${parsedArg}))`;
                    case "Object.keys":
                        return `is_array(${parsedArg}) ? array_keys(${parsedArg}) : array()`;
                    case "Object.values":
                        return `is_array(${parsedArg}) ? array_values(${parsedArg}) : array()`;
                }
            }
            const transformedProp = this.transformPropertyInsideCallExpressionIfNeeded(node.expression);

            if (transformedProp) {
                return transformedProp;
            }
    
            const leftSide = node.expression?.expression;
            const rightSide = node.expression.name?.escapedText;
    
            const arg = args && args.length > 0 ? args[0] : undefined;
            
            if (arg) {
                const argText = this.printNode(arg, identation).trimStart();
                const leftSideText = this.printNode(leftSide, 0);
                const type = global.checker.getTypeAtLocation(leftSide); // eslint-disable-line
                switch (rightSide) {
                    case 'push':
                        return leftSideText + "[] = " + argText;
                    case 'includes': // "ol".includes("o") -> str_contains("ol", "o") or [12,3,4].includes(3) -> in_array(3, [12,3,4])
                        if (this.isStringType(type.flags)) {
                            return "str_contains(" + leftSideText + ", " + argText + ")";
                        } else {
                            return "in_array(" + argText + ", " + leftSideText + ")";
                        }
                    case 'indexOf':
                        if (this.isStringType(type.flags)) {
                            return "mb_strpos(" + leftSideText + ", " + argText + ")";
                        } else {
                            return "array_search(" + argText + ", " + leftSideText + ")";
                        }
                    case 'join': // [1,2,3].join(',') => implode(',', [1,2,3])
                        return "implode(" + argText + ", " + leftSideText + ")";
                    case 'split': // "ol".split("o") -> explode("o", "ol")
                        return "explode(" + argText + ", " + leftSideText + ")"; 
                }
            }
        }
        return undefined;
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

    isComment(line){
        line = line.trim();
        return line.startsWith("//") || line.startsWith("/*") || line.startsWith("*");
    }

    printFunctionBody(node, identation) {

        if (this.asyncTranspiling && this.isAsyncFunction(node)) {
            const blockOpen = this.getBlockOpen();
            const blockClose = this.getBlockClose(identation);

            const parsedArgs = node.parameters.map(param => this.printParameter(param, false)).join(", ");
            const params = parsedArgs ? " use (" + parsedArgs + ")" : "";

            const bodyStms = node.body.statements;
            const firstBodyStm = this.printNode(bodyStms[0], identation+2);
            bodyStms.shift();
            const funcBody = bodyStms.map((s) => this.printNode(s, identation+2)).join("\n");

            // reformat first comment
            const bodyParts = firstBodyStm.split("\n");
            const commentPart = bodyParts.filter(line => this.isComment(line));
            const isComment = commentPart.length > 0;
            let header = this.getIden(identation+1) +  "return Async\\async(function ()" + params + " {\n";
            if (isComment) {
                const commentPartString = commentPart.map((c) => this.getIden(identation+1) + c.trim()).join("\n");
                const firstStmNoComment = bodyParts.filter(line => !this.isComment(line)).join("\n");
                header = commentPartString + "\n" + header + firstStmNoComment + "\n";
            } else {
                header += firstBodyStm + "\n";
            }

            const result = header
            + funcBody + "\n"
            + this.getIden(identation+1) + "}) ();";

            return blockOpen + result + blockClose;
        }
        return super.printFunctionBody(node, identation);
    }

    transformLeadingComment(comment) {
        const commentRegex = [
            [ /\{([\]\[\|a-zA-Z0-9_-]+?)\}/g, '~$1~' ], // eslint-disable-line -- resolve the "arrays vs url params" conflict (both are in {}-brackets)
            [ /\[([^\]\[]*)\]\{(@link .*)\}/g, '~$2 $1~' ], // eslint-disable-line -- docstring item with link
            [ /\s+\* @method/g, '' ], // docstring @method
            [ /(\s+)\* @description (.*)/g, '$1\* $2' ], // eslint-disable-line
            [ /\s+\* @name .*/g, '' ], // docstring @name
            [ /(\s+)\* @returns/g, '$1\* @return' ], // eslint-disable-line
            [ /\~([\]\[\|@\.\s+\:\/#\-a-zA-Z0-9_-]+?)\~/g, '{$1}' ], // eslint-disable-line -- resolve the "arrays vs url params" conflict (both are in {}-brackets)
            [ /(\s+ \* @(param|return) {[^}]*)object([^}]*}.*)/g, '$1array$3' ], // docstring type conversion
        ];

        const transformed = regexAll(comment, commentRegex);

        return transformed;
    }

    initConfig() {
        this.LeftPropertyAccessReplacements = {
            'this': '$this',
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
            'Promise.all': 'Promise\\all',
        };

        this.CallExpressionReplacements = {
            'parseFloat': 'floatval',
            'parseInt': 'intval',
        };

        this.PropertyAccessRequiresParenthesisRemoval = [
            // 'length',
            // 'toString',
            // 'toUpperCase',
            // 'toLowerCase',
            // 'pop',
            // 'shift',
        ];
    }

}
