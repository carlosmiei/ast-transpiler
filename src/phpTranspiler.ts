import { BaseTranspiler } from "./pureAst.js";
import ts from 'typescript';

const SyntaxKind = ts.SyntaxKind;

const filename = "tmp.ts";

const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker()

global.src = sourceFile;
global.checker = typeChecker

const config = {
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
    'LINE_TERMINATOR': ';'

}

export class PhpTranspiler extends BaseTranspiler {
    constructor() {
        super(config);

        this.initConfig();
    }

    getIdentifierValueKind(identifier) {
        const idValue = identifier.text ?? identifier.escapedText;

        if (idValue === "undefined") {
            return this.UNDEFINED_TOKEN;
        }
        return "$" + idValue; // check this later
    }

    printFunctionDeclaration(node, identation) {
        const { name:{ escapedText }, parameters, body, type: returnType} = node;

        let parsedArgs = (parameters.length > 0) ? this.parseParameters(parameters, this.FunctionDefSupportedKindNames) : [];

        const parsedArgsAsString = parsedArgs.map((a) => {
            return `${a.name ?? a}`
        }).join(", ");

        let functionDef = this.getIden(identation) + this.printModifiers(node) + "function " + escapedText
            + "(" + parsedArgsAsString + ")"
            + "{\n"
            // // NOTE - must have RETURN TYPE in TS
            // + SupportedKindNames[returnType.kind]
            // +" {\n";

        const funcBodyIdentation = identation + 1
        const statementsAsString = body.statements.map((s) => {
            return this.printNode(s, funcBodyIdentation);
        }).filter((s)=>!!s).join("\n");

        functionDef += statementsAsString + "\n" + this.getIden(identation) + "}";

        return functionDef;
    }


    initConfig() {
    }

}


// const transpiler = new PhpTranspiler();
// const res = transpiler.printNode(sourceFile)
// console.log(res)
