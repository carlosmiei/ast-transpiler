const ts = require('typescript');

const filename = "tmp.ts";

const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker()

// let code = `
// const x = 12;
// class Greeter {
//     greeting: string;
    
//     teste() {
//         console.log("Hello, " + this.greeting);
//     }
// }
// console.log('hello world')
// function giveMessage(message: string): string {
//     return "compiling message will be: " + message;
// }

// giveMessage("how are you");
// `;

// code = `
// class Greeter {
    
//     teste() {
//         console.log("Hello");
//         const x = [[12,3],2,3]
//         const y = x.length;
//     return 3333
//     }
// }
// `;

// const code = `
// const x = [12,2,3]
// const y = x.length;
// `;

// var sourceFile = ts.createSourceFile('tmp2.ts', code);

// var program = ts.createProgram(['tmp2.ts'], {});

// const typeChecker = program.getTypeChecker();

global.sourceFile = sourceFile;
global.checker = typeChecker

// code = "const x = y.length";

// global.code = code;
let generatedCode = ""

const PropertyAccessReplacements = {
    'console.log': 'print'
}


const SupportedKindNames = {
    [ts.SyntaxKind.StringLiteral]: "StringLiteral",
    [ts.SyntaxKind.StringKeyword]: "String",
    [ts.SyntaxKind.NumberKeyword]: "Number",
    [ts.SyntaxKind.PlusToken]: "+",
    [ts.SyntaxKind.LessThanToken]: "<",
    [ts.SyntaxKind.LessThanEqualsToken]: "<=",
    [ts.SyntaxKind.GreaterThanToken]: ">",
    [ts.SyntaxKind.GreaterThanEqualsToken]: ">=",
    [ts.SyntaxKind.EqualsEqualsToken]: "==",
    [ts.SyntaxKind.EqualsEqualsEqualsToken]: "==",
}

const PostFixOperators = {
    [ts.SyntaxKind.PlusPlusToken]: "++",
    [ts.SyntaxKind.MinusMinusToken]: "--",
}

const FunctionDefSupportedKindNames = {
    [ts.SyntaxKind.StringKeyword]: "string"
};

;

function getIden (num) {
    return "    ".repeat(num);
}


function getIdentifierValueKind(identifier) {
    // if (identifier.kind === ts.SyntaxKind.StringLiteral) {
    //     return `"${identifier.text}".to_owned()`;
    // }
    // if (identifier.kind === ts.SyntaxKind.Identifier) {
    //     return "&" + identifier.escapedText
    // }
    return identifier.text ?? identifier.escapedText; // check this later
}

function printBinaryExpression({left, right, operatorToken}) {

    const leftVar = getIdentifierValueKind(left);
    const rightVar = getIdentifierValueKind(right);

    const operator = SupportedKindNames[operatorToken.kind];

    return leftVar +" "+ operator + " " + rightVar;
}


function printPropertyAccessExpression(node, identation) {
    const {expression, name} = node;

    const leftSide = node.expression.escapedText;
    let rightSide = node.name.escapedText;

    const idType = checker.getTypeAtLocation(node.expression);

    if (rightSide === "length") {
        if (checker.isArrayType(idType)) {
            rightSide = "lenArray";
        }
    }

    const rawExpression = leftSide + "." + rightSide;

    if (PropertyAccessReplacements[rawExpression]) {
        return getIden(identation) + PropertyAccessReplacements[rawExpression];
    }

    return getIden(identation) + rawExpression;
}

function printExpressionStatement(expressionStatement, identation) {

    if (expressionStatement.kind === ts.SyntaxKind.BinaryExpression) {
        const binaryExpressionString =  printBinaryExpression(expressionStatement);
        return binaryExpressionString;
    }

    if (expressionStatement.kind === ts.SyntaxKind.CallExpression) {
        const {expression, arguments} = expressionStatement;
        return printCallExpression(expressionStatement, identation);
    }
    // is node object prin
    if (expressionStatement.kind === ts.SyntaxKind.PropertyAccessExpression) {
        return printPropertyAccessExpression(expressionStatement, identation)
    }
    
    if (expressionStatement.kind === ts.SyntaxKind.PostfixUnaryExpression) {
        return printPostFixUnaryExpression(expressionStatement, identation);
    }

    if (expressionStatement.kind === ts.SyntaxKind.Identifier) {
        return expressionStatement.escapedText;
    }
}

function parseParameters(parameters, kindNames) {
    return parameters
            .map((item) => {
                if (ts.isToken(item)) {
                    return {
                        name: item.text,
                        type: kindNames[item.kind]
                    }
                }

                const name = ts.getNameOfDeclaration(item);

                const token = item.type;

                return {
                    name: name.escapedText,
                    type: (token !== undefined) ? kindNames[token.kind] : undefined
                }
            })
            .filter(item => !!item);
}

function printFunction(node) {
    const { name:{ escapedText }, parameters, body, type: returnType} = node;

    const parsedArgs = parseParameters(parameters, FunctionDefSupportedKindNames);

    const parsedArgsAsString = parsedArgs.map((a) => {
        return `${a.name}: ${a.type}`
    }).join(", ");

    let functionDef = "pub fn " + escapedText
        + "(" + parsedArgsAsString + ")"
        + "->"
        // NOTE - must have function RETURN TYPE in TS
        + SupportedKindNames[returnType.kind]
        +" {\n";

    const statementsAsString = body.statements.map((s) => {
        if (s.kind === ts.SyntaxKind.ReturnStatement) {
//            console.log("this function returns data");
            const exprString = printExpressionStatement(s.expression);
            return "  return " + exprString
        }

        // unknown stuff at this point
        return "";
    }).filter((s)=>!!s).join("");

//    console.log("====statements as str:", statementsAsString);

    functionDef += statementsAsString + "}";

    //console.log("+++++++", functionDef);
    return functionDef;
}

function printMethodDeclaration(node, identation) {
    const { name:{ escapedText }, parameters, body, type: returnType} = node;

    let parsedArgs = (parameters.length > 0) ? parseParameters(parameters, FunctionDefSupportedKindNames) : [];

    parsedArgs.unshift("self")
    const parsedArgsAsString = parsedArgs.map((a) => {
        return `${a.name ?? a}`
    }).join(", ");

    let functionDef = getIden(identation) +  "def " + escapedText
        + "(" + parsedArgsAsString + ")"
        + ":\n"
        // // NOTE - must have function RETURN TYPE in TS
        // + SupportedKindNames[returnType.kind]
        // +" {\n";

    const funcBodyIdentation = identation + 1
    const statementsAsString = body.statements.map((s) => {
        if (s.kind === ts.SyntaxKind.ReturnStatement) {
            return getIden(funcBodyIdentation )  + "return " + printTree(s.expression, 0);
        }

        return printTree(s, funcBodyIdentation);

    }).filter((s)=>!!s).join("\n");

    functionDef += statementsAsString;

    return functionDef;
}

function printStringLiteral(node) {
    return '"' + node.text + '"';
}

function printNumericLiteral(node) {
    return node.text;
}

function printArrayLiteralExpression(node) {

    const elements = node.elements.map((e) => {
        return printTree(e);
    }).join(", ");
    return "[[" + elements + "]]";
}

function printVariableDeclarationList(node,identation) {
    const declaration = node.declarations[0];
    const name = declaration.name.escapedText;
    const parsedValue = printTree(declaration.initializer, 0);
    return getIden(identation) + name + " = " + parsedValue;
}

function printVariableStatement(node, identation){
    const decList = node.declarationList;
    return printVariableDeclarationList(decList, identation);

}

function printCallExpression(node, identation) {
    const {expression, arguments} = node;

    const parsedExpression = printTree(expression, 0);
    const parsedArgs = arguments.map((a) => {
        return printTree(a, 0);
    }).join(",")  

    return getIden(identation) + parsedExpression + "(" + parsedArgs + ")";
}


function printClass(node, identation) {
    const className = node.name.escapedText;
    const classInit = "class " + className + ":\n";
    
    const classBody = node.members.map((m)=> {
        return printTree(m, identation+1);
    }).join("\n") 

    return classInit + classBody;
}

function printWhileStatement(node, identation) {
    const loopExpression = node.expression;

    let expression = "";
    if (ts.SyntaxKind.TrueKeyword === loopExpression.kind) {
        expression = "True";
    } else {
        expression = printTree(loopExpression, 0);
    }
    
    return getIden(identation) + "while "+ expression +":\n" + node.statement.statements.map(st => printTree(st, identation+1)).join("\n");
}

function printForStatement(node, identation) {
    // currently only let i =0 ; i< 20; i++ is supported
    const varName = node.initializer.declarations[0].name.escapedText; 
    const initValue = node.initializer.declarations[0].initializer.text
    const roofValue = node.condition.right.text;

    // const init = printVariableDeclarationList(initializer.declarations, 0);
    // const cond = printTree(condition, 0);
    // const inc = printTree(incrementor, 0);

    return getIden(identation) + "for " + varName + " in range(" + initValue + ", " + roofValue + "):\n" + node.statement.statements.map(st => printTree(st, identation+1)).join("\n");
}

function printBreakStatement(node, identation) {
    return getIden(identation) + "break";
}

function printPostFixUnaryExpression(node, identation) {
    const {operand, operator} = node;
    return getIden(identation) + getIdentifierValueKind(operand) + PostFixOperators[operator]; 
}



function printTree(node, identation) {

    if(ts.isExpressionStatement(node)) {
        return printExpressionStatement(node.expression, identation);
    } else if (ts.isFunctionDeclaration(node)){
        return printFunction(node, identation);
    } else if (ts.isClassDeclaration(node)) {
        return printClass(node, identation) 
    } else if (ts.isVariableStatement(node)) {
        return printVariableStatement(node, identation);
    } else if (ts.isMethodDeclaration(node)) {
        return printMethodDeclaration(node, identation) 
    } else if (ts.isStringLiteral(node)) {
        return printStringLiteral(node);
    } else if (ts.isNumericLiteral(node)) {
        return printNumericLiteral(node);
    } else if (ts.isPropertyAccessExpression(node)) {
        return printPropertyAccessExpression(node, identation);
    } else if (ts.isArrayLiteralExpression(node)) {
        return printArrayLiteralExpression(node);
    } else if (ts.isCallExpression(node)) {
        return printCallExpression(node, identation);
    } else if (ts.isWhileStatement(node)) {
        return printWhileStatement(node, identation);
    } else if (ts.isBinaryExpression(node)) {
        return printBinaryExpression(node, identation);
    } else if (ts.isBreakStatement(node)) {
        return printBreakStatement(node, identation);
    } else if (ts.isForStatement(node)) {
        return printForStatement(node, identation);
    } else if (ts.isPostfixUnaryExpression(node)) {
        return printPostFixUnaryExpression(node, identation);
    } else if (ts.isVariableDeclarationList(node)) {
        return printVariableDeclarationList(node, identation); // statements are slightly different if inside a for
    }


    // switch(node) {
    //     case ts.isExpressionStatement(node):
    //         return printExpressionStatement(node.expression, identation);
    //     case ts.isFunctionDeclaration(node):
    //         return printFunction(node, identation);
    //     case ts.isClassDeclaration(node):
    //         return printClass(node, identation);
    //     case ts.isVariableStatement(node):
    //         return printVariableStatement(node, identation);
    //     case ts.isMethodDeclaration(node):
    //         return printMethodDeclaration(node, identation);
    // }


    if (node.statements) {
        const transformedStatements = node.statements.map((m)=> {
            return printTree(m, identation + 1);
        });

        return transformedStatements.join("\n");
    }
    return "";
}

const res = printTree(sourceFile,-1);
console.log("-compiled-->\n", res);