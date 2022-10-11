const ts = require('typescript');

const filename = "tmp.ts";

const program = ts.createProgram([filename], {});

const sourceFile = program.getSourceFile(filename);

const typeChecker = program.getTypeChecker();

// const node11 = sourceFile.statements[0]
// const node2 = sourceFile.statements[1]

// const value = typeChecker.getTypeAtLocation(node11.declarationList.declarations[0])
// const value2 = node2.declarationList.declarations[0];
// const value3 = value2.initializer;

// console.log(value)
// 

let output = "";
const visitor = (node) => {
    if (ts.isAccessExpression(node)) {
        const leftType = checker.getTypeAtLocation(node.expression);
        const rightName = node.name.text;
        if (checker.isArrayType(leftType) && rightName === "length") output += `${node.expression.getText()}.len();` 
    } else {
        output += `${node.getText()};`;
    }
    ts.visitEachChild(node, visitor);
}

visitor(sourceFile)