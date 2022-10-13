const ts = require('typescript');

const filename = "tmp.ts";

const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker()


global.sourceFile = sourceFile;
global.checker = typeChecker

let generatedCode = ""

// python property replacement
const PropertyAccessReplacements = {
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
}

const DEFAULT_IDENTATION = "    ";
const UNDEFINED_CORRESPONDENT = "None";

const THIS_CORRESPONDENT = "self";
const OBJECT_OPENING = "{";
const OBJECT_CLOSING = "}";
const LEFT_PARENTHESIS = "(";
const RIGHT_PARENTHESIS = ")";
const LEFT_ARRAY_OPENING = "[";
const RIGHT_ARRAY_CLOSING = "]";
const TRUE_KEYWORD = "True";
const FALSE_KEYWORD = "False";
const NEW_CORRESPODENT = "new";
const THROW_CORRESPONDENT = "raise";
const AWAIT_CORRESPONDENT = "await";
const STATIC_CORRESPONDENT = "static";
const ASYNC_CORRESPONDENT =  "async";

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
    [ts.SyntaxKind.BarBarToken]: "or",
    [ts.SyntaxKind.AmpersandAmpersandToken]: "and",
    [ts.SyntaxKind.ExclamationEqualsEqualsToken]: "!=",
    [ts.SyntaxKind.ExclamationEqualsToken]: "!=",
    [ts.SyntaxKind.AsyncKeyword]: ASYNC_CORRESPONDENT,
    [ts.SyntaxKind.AwaitKeyword]: AWAIT_CORRESPONDENT,
    [ts.SyntaxKind.StaticKeyword]: STATIC_CORRESPONDENT,
}

const PostFixOperators = {
    [ts.SyntaxKind.PlusPlusToken]: "++",
    [ts.SyntaxKind.MinusMinusToken]: "--",
}

const PrefixFixOperators = {
    [ts.SyntaxKind.ExclamationToken]: "not",
}

const FunctionDefSupportedKindNames = {
    [ts.SyntaxKind.StringKeyword]: "string"
};

function getIden (num) {
    return DEFAULT_IDENTATION.repeat(num);
}

function getIdentifierValueKind(identifier) {
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
        leftSide = THIS_CORRESPONDENT;
    }
    let rightSide = node.name.escapedText;

    const idType = checker.getTypeAtLocation(node.expression);

    leftSide = PropertyAccessReplacements[leftSide] ?? leftSide;
    
    let rawExpression = leftSide + "." + rightSide;
    

    
    if (rightSide === "length") {
        // if (checker.isArrayType(idType)) {
            rawExpression =  "len(" + leftSide + ")";
        // }
    } else if (rightSide === "toString") {
        rawExpression = "str(" + leftSide + ")";
    }

    if (PropertyAccessReplacements[rawExpression]) {
        return getIden(identation) + PropertyAccessReplacements[rawExpression];
    }

    return getIden(identation) + rawExpression;
}

function printExpressionStatement(expressionStatement, identation) {

    // if (expressionStatement.kind === ts.SyntaxKind.BinaryExpression) {
    //     return printBinaryExpression(expressionStatement, identation);
    // }

    // if (expressionStatement.kind === ts.SyntaxKind.CallExpression) {
    //     const {expression, arguments} = expressionStatement;
    //     return printCallExpression(expressionStatement, identation);
    // }
    // // is node object prin
    // if (expressionStatement.kind === ts.SyntaxKind.PropertyAccessExpression) {
    //     return printPropertyAccessExpression(expressionStatement, identation)
    // }
    
    // if (expressionStatement.kind === ts.SyntaxKind.PostfixUnaryExpression) {
    //     return printPostFixUnaryExpression(expressionStatement, identation);
    // }

    // if (expressionStatement.kind === ts.SyntaxKind.Identifier) {
    //     return expressionStatement.escapedText;
    // }
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

function printModifiers(node) {
    const modifiers = node.modifiers;
    if (modifiers === undefined) {
        return "";
    }

    return modifiers.map(item => SupportedKindNames[item.kind]).join(" ") + " ";

}

function printFunction(node, identation) {
    const { name:{ escapedText }, parameters, body, type: returnType} = node;

    let parsedArgs = (parameters.length > 0) ? parseParameters(parameters, FunctionDefSupportedKindNames) : [];

    const parsedArgsAsString = parsedArgs.map((a) => {
        return `${a.name ?? a}`
    }).join(", ");

    let functionDef = getIden(identation) + printModifiers(node) + "def " + escapedText
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

function printMethodDeclaration(node, identation) {
    const { name:{ escapedText }, parameters, body, type: returnType} = node;

    let parsedArgs = (parameters.length > 0) ? parseParameters(parameters, FunctionDefSupportedKindNames) : [];

    parsedArgs.unshift("self")
    const parsedArgsAsString = parsedArgs.map((a) => {
        return `${a.name ?? a}`
    }).join(", ");

    let functionDef = getIden(identation) + printModifiers(node) + "def " + escapedText
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
    return LEFT_ARRAY_OPENING + elements + RIGHT_ARRAY_CLOSING;
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

function printOutOfOrderCallExpressionIfAny(node, identation) {
    const expressionText = node.expression.getText();
    const arguments = node.arguments;
    let finalExpression = undefined;
    switch (expressionText) {
        case "Array.isArray":
            finalExpression = "isinstance(" + printTree(arguments[0], 0) + ", list)";
            break;
        case "Math.floor":
            finalExpression = "int(math.floor(" + printTree(arguments[0], 0) + "))";
            break;
        case "Object.keys":
            finalExpression = "list(" + printTree(arguments[0], 0) + ".keys())";
            break;
        case "Object.values":
            finalExpression = "list(" + printTree(arguments[0], 0) + ".values())";
            break;
        case "Math.round":
            finalExpression = "int(math.round(" + printTree(arguments[0], 0) + "))";
        case "Math.ceil":
            finalExpression = "int(math.ceil(" + printTree(arguments[0], 0) + "))";
    }
    if (finalExpression) {
        return getIden(identation) + finalExpression;
    }
    return undefined
}

function printCallExpression(node, identation) {

    const {expression, arguments} = node;

    let finalExpression = printOutOfOrderCallExpressionIfAny(node, identation);

    if (finalExpression) {
        return getIden(identation) + finalExpression;
    }

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

    const expression = printTree(loopExpression, 0);
    
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
    return getIden(identation) + printTree(operand, 0) + PostFixOperators[operator]; 
}

function printPrefixUnaryExpression(node, identation) {
    const {operand, operator} = node;
    return getIden(identation) + PrefixFixOperators[operator] + " " + printTree(operand, 0); 
}

function printObjectLiteralExpression(node, identation) {
    const objectBody = node.properties.map((p) => printTree(p)).join(", ");

    return OBJECT_OPENING + " " + objectBody + " " + OBJECT_CLOSING;
}

function printPropertyAssignment(node, identation) {
    const {name, initializer} = node;
    const nameAsString = printTree(name, 0);
    const valueAsString = printTree(initializer, 0);

    return nameAsString + ": " + valueAsString;
}

function printElementAccessExpression(node, identation) {
    // example x['test']
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

    const elseStatement = node.elseStatement

    if (elseStatement?.kind === ts.SyntaxKind.Block) {
        const elseBody = getIden(identation) + elseString + ':\n' + elseStatement.statements.map((s) => printTree(s, identation+1)).join("\n");
        ifComplete += elseBody;
    } else if (elseStatement?.kind === ts.SyntaxKind.IfStatement) {
        const elseBody = printIfStatement(elseStatement, identation);
        ifComplete += elseBody;
    }

    return ifComplete;
}

function printParenthesizedExpression(node, identation) {
    return getIden(identation) + LEFT_PARENTHESIS + printTree(node.expression, 0) + RIGHT_PARENTHESIS;
}

function printBooleanLiteral(node) {
    if (ts.SyntaxKind.TrueKeyword === node.kind) {
        return TRUE_KEYWORD;
    }
    return FALSE_KEYWORD;
}

function printTryStatement(node, identation) {
    const tryBody = node.tryBlock.statements.map((s) => printTree(s, identation+1)).join("\n");
    const catchBody = node.catchClause.block.statements.map((s) => printTree(s, identation+1)).join("\n");

    return getIden(identation) + "try:\n" + tryBody + "\n" + getIden(identation) + "except:\n" + catchBody;
}

function printNewExpression(node, identation) {
    const expression =  printTree(node.expression, 0)
    const args = node.arguments.map(n => printTree(n, 0)).join(",")
    return NEW_CORRESPODENT + " " + expression + LEFT_PARENTHESIS + args + RIGHT_PARENTHESIS;
}

function printThrowStatement(node, identation) {
    const expression = printTree(node.expression, 0);
    return getIden(identation) + THROW_CORRESPONDENT + " " + expression;
}

function printAwaitExpression(node, identation) {
    const expression = printTree(node.expression, 0);
    return getIden(identation) + AWAIT_CORRESPONDENT + " " + expression;
}

function printConditionalExpression(node, identation) {
    const condition = printTree(node.condition, 0);
    const whenTrue = printTree(node.whenTrue, 0);
    const whenFalse = printTree(node.whenFalse, 0);

    return getIden(identation) + whenTrue + " if " + condition + " else " + whenFalse;
}

function printTree(node, identation) {

    if(ts.isExpressionStatement(node)) {
        // return printExpressionStatement(node.expression, identation);
        return printTree(node.expression, identation);
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
    } else if (ts.isParenthesizedExpression(node)) {
        return printParenthesizedExpression(node, identation);
    } else if (ts.isBooleanLiteral(node)) {
        return printBooleanLiteral(node);
    } else if (ts.isTryStatement(node)){
        return printTryStatement(node, identation);
    } else if (ts.isPrefixUnaryExpression(node)) {
        return printPrefixUnaryExpression(node, identation);
    } else if (ts.isNewExpression(node)) {
        return printNewExpression(node, identation);
    } else if (ts.isThrowStatement(node)) {
        return printThrowStatement(node, identation);
    } else if (ts.isAwaitExpression(node)) {
        return printAwaitExpression(node, identation);
    } else if (ts.isConditionalExpression(node)) {
        return printConditionalExpression(node, identation);
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
console.log("-compiled-->\n" + res);