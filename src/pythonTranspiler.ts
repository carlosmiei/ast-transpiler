import { BaseTranspiler } from "./pureAst.js";
import { regexAll } from "./utils.js";
import ts from 'typescript';

const SyntaxKind = ts.SyntaxKind;

const config = {
}

export class PythonTranspiler extends BaseTranspiler {
    constructor() {
        super(config);

        this.initConfig();
    }

    initConfig() {
        this.LeftPropertyAccessReplacements = {
            'this': 'self'
        }
        this.RightPropertyAccessReplacements = {
            'push': 'append',
            'toUpperCase': 'upper',
            'toLowerCase': 'lower',
            'parseFloat': 'float',
            'parseInt': 'int',
            'indexOf': 'find',
        }
        this.FullPropertyAccessReplacements = {
            'console.log': 'print',
            'JSON.stringify': 'json.dumps',
            'JSON.parse': 'json.loads',
            'Math.log': 'math.log',
            'Math.abs': 'abs',
            'process.exit': 'sys.exit',
        }
        this.CallExpressionReplacements = {
            'parseInt': 'int',
            'parseFloat': 'float',
        }
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
                finalExpression = "int(math.round(" + this.printNode(args[0], 0) + "))";
            case "Math.ceil":
                finalExpression = "int(math.ceil(" + this.printNode(args[0], 0) + "))";
        }
        if (finalExpression) {
            return this.getIden(identation) + finalExpression;
        }
        return undefined
    }

    printElementAccessExpressionExceptionIfAny(node) {
        if (node.expression.kind === SyntaxKind.ThisKeyword) {
            return "getattr(self, " + this.printNode(node.argumentExpression, 0) + ")";
        }
    }

    printForStatement(node, identation) {
        const varName = node.initializer.declarations[0].name.escapedText; 
        const initValue = this.printNode(node.initializer.declarations[0].initializer, 0)
        const roofValue = this.printNode(node.condition.right,0)

        return this.getIden(identation) + this.FOR_TOKEN +  " " + varName + " in range(" + initValue + ", " + roofValue + "):\n" + node.statement.statements.map(st => this.printNode(st, identation+1)).join("\n") + "\n";
    }

    transformFunctionComment(comment) {
        const commentRegex = [
                [ /\/\*\*/, '\"\"\"' ], // Doc strings
                [ / \*\//, '\"\"\"' ], // Doc strings
                [ /\s+\* @method/g, '' ], // docstring @method
                [ /(\s+) \* @description (.*)/g, '$1$2' ], // docstring description
                [ /\s+\* @name .*/g, '' ], // docstring @name
                [ /(\s+) \* @see( .*)/g, '$1see$2' ], // docstring @see
                [ /(\s+ \* @(param|returns) {[^}]*)string([^}]*}.*)/g, '$1str$3' ], // docstring type conversion
                [ /(\s+ \* @(param|returns) {[^}]*)object([^}]*}.*)/g, '$1dict$3' ], // doctstrubg type conversion
                [ /(\s+) \* @returns ([^\{])/g, '$1:returns: $2' ], // docstring return
                [ /(\s+) \* @returns \{(.+)\}/g, '$1:returns $2:' ], // docstring return
                [ /(\s+ \* @param \{[\]\[\|a-zA-Z]+\} )([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+) (.*)/g, '$1$2[\'$3\'] $4' ], // docstring params.anything
                [ /(\s+) \* @([a-z]+) \{([\]\[a-zA-Z\|]+)\} ([a-zA-Z0-9_\-\.\[\]\']+)/g, '$1:$2 $3 $4:' ], // docstring para 
            ];

        const transformed = regexAll(comment, commentRegex);

        return transformed;
    }

    transformPropertyAcessExpressionIfNeeded(node: any) {
        const expression = node.expression;
        let leftSide = this.printNode(expression, 0);
        let rightSide = node.name.escapedText;
        
        let rawExpression = undefined;

        if (rightSide === "length") {
            rawExpression =  "len(" + leftSide + ")";
        } else if (rightSide === "toString") {
            rawExpression = "str(" + leftSide + ")";
        }
        return rawExpression;
    }

    shouldRemoveParenthesisFromCallExpression(node) {

        if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propertyAccessExpression = node.expression;
            const propertyAccessExpressionName = propertyAccessExpression.name.text;
            if (propertyAccessExpressionName === "length"
                || propertyAccessExpressionName === "toString")
            { // add more exceptions here
                return true; 
            }
        }
        return false;
    }

    printClass(node, identation) {
        const className = node.name.escapedText;
        const heritageClauses = node.heritageClauses;

        let classInit = "";
        if (heritageClauses !== undefined) {
            const classExtends = heritageClauses[0].types[0].expression.escapedText;
            classInit = this.getIden(identation) + "class " + className + "(" + classExtends + "):\n";
        } else {
            classInit = this.getIden(identation) + "class " + className + ":\n";
        }

        const classBody = this.printClassBody(node, identation);
        
        return classInit + classBody;
    }

    printMethodParameters(node) {
        let parsedArgs = super.printMethodParameters(node);
        parsedArgs = parsedArgs ? "self " + parsedArgs : "self";
        return parsedArgs;
    }

}