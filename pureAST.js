const ts = require('typescript');

const filename = "tmp.ts";

const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker()


global.sourceFile = sourceFile;
global.checker = typeChecker

let generatedCode = ""

const PropertyAccessReplacements = {
    'this': 'self',
    'console.log': 'print'
}

const UNDEFINED_CORRESPONDENT = "None";

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
    [ts.SyntaxKind.EqualsToken]: "=", 
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
    const idValue = identifier.text ?? identifier.escapedText;

    if (idValue === "undefined") {
        return UNDEFINED_CORRESPONDENT;
    }
    return idValue; // check this later
}

function printBinaryExpression(node, identation) {
    const {left, right, operatorToken} = node;;

    const leftVar = printTree(left, 0)

    const rightVar = printTree(right, 0)

    const operator = SupportedKindNames[operatorToken.kind];

    return getIden(identation) + leftVar +" "+ operator + " " + rightVar;
}


function printPropertyAccessExpression(node, identation) {

    const expression = node.expression;
    
    let leftSide = expression?.escapedText;
    if (expression.kind === ts.SyntaxKind.ThisKeyword) {
        leftSide = "self";
    }
    let rightSide = node.name.escapedText;

    const idType = checker.getTypeAtLocation(node.expression);

    leftSide = PropertyAccessReplacements[leftSide] ?? leftSide;
    
    let rawExpression = leftSide + "." + rightSide;
    
    if (rightSide === "length") {
        if (checker.isArrayType(idType)) {
            rawExpression =  "len(" + leftSide + ")";
        }
    }


    if (PropertyAccessReplacements[rawExpression]) {
        return getIden(identation) + PropertyAccessReplacements[rawExpression];
    }

    return getIden(identation) + rawExpression;
}

function printExpressionStatement(expressionStatement, identation) {

    if (expressionStatement.kind === ts.SyntaxKind.BinaryExpression) {
        return printBinaryExpression(expressionStatement, identation);
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


    functionDef += statementsAsString + "}";

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
    const initValue = printTree(node.initializer.declarations[0].initializer, 0)
    const roofValue = printTree(node.condition.right,0)

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

function printObjectLiteralExpression(node, identation) {
    const objectOpening = "{";
    const objectClosing = "}";
    const objectBody = node.properties.map((p) => printTree(p)).join(", ");

    return objectOpening + " " + objectBody + " " + objectClosing;
}

function printPropertyAssignment(node, identation) {
    const {name, initializer} = node;
    const nameAsString = printTree(name, 0);
    const valueAsString = printTree(initializer, 0);

    return nameAsString + ": " + valueAsString;
}

function printElementAccessExpression(node, identation) {
    const {expression, argumentExpression} = node;
    const expressionAsString = printTree(expression, 0);
    const argumentAsString = printTree(argumentExpression, 0);

    return expressionAsString + "[" + argumentAsString + "]";
}

function printIfStatement(node, identation) {
    const expression = printTree(node.expression, 0)
    const ifBody = node.thenStatement.statements.map((s) => printTree(s, identation+1)).join("\n");

    const ifString=  'if';
    const elseIfString = 'elif';
    const elseString = 'else';

    const isElseIf = node.parent.kind === ts.SyntaxKind.IfStatement;

    const prefix = isElseIf ? elseIfString : ifString;

    let ifComplete  =  getIden(identation) + prefix + " " + expression + ":\n" + ifBody + "\n";

    const elseStatement =  node.elseStatement

    if (elseStatement.kind === ts.SyntaxKind.Block) {
        const elseBody = getIden(identation) + elseString + ':\n' + elseStatement.statements.map((s) => printTree(s, identation+1)).join("\n");
        ifComplete += elseBody;
    } else if (elseStatement.kind === ts.SyntaxKind.IfStatement) {
        const elseBody = printIfStatement(elseStatement, identation);
        ifComplete += elseBody;
    }

    return ifComplete;
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
    } else if (ts.isObjectLiteralExpression(node)) {
        return printObjectLiteralExpression(node, identation);
    } else if (ts.isPropertyAssignment(node)) {
        return printPropertyAssignment(node, identation);
    } else if (ts.isIdentifier(node)) {
        return getIdentifierValueKind(node);
    } else if (ts.isElementAccessExpression(node)) {
        return printElementAccessExpression(node);
    } else if (ts.isIfStatement(node)) {
        return printIfStatement(node, identation);
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