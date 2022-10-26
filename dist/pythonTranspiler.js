import { BaseTranspiler } from "./pureAst.js";
import ts from 'typescript';
const SyntaxKind = ts.SyntaxKind;
const filename = "tmp.ts";
const config = {
// 'DEFAULT_IDENTATION': 'WORKED'
};
const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker();
global.src = sourceFile;
global.checker = typeChecker;
export class PythonTranspiler extends BaseTranspiler {
    constructor() {
        super(config);
        this.initConfig();
    }
    initConfig() {
        this.PropertyAccessReplacements = {
            // right side 
            'this': 'self',
            'push': 'append',
            'toUpperCase': 'upper',
            'toLowerCase': 'lower',
            'parseFloat': 'float',
            'parseInt': 'int',
            'indexOf': 'find',
            // both sides
            'console.log': 'print',
            'JSON.stringify': 'json.dumps',
            'JSON.parse': 'json.loads',
            'Math.log': 'math.log',
            'Math.abs': 'abs',
            'process.exit': 'sys.exit',
        };
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
        const roofValue = this.printNode(node.condition.right, 0);
        return this.getIden(identation) + this.FOR_TOKEN + " " + varName + " in range(" + initValue + ", " + roofValue + "):\n" + node.statement.statements.map(st => this.printNode(st, identation + 1)).join("\n");
    }
}
// const transpiler = new PythonTranspiler();
// const res = transpiler.printNode(sourceFile)
// console.log(res)
