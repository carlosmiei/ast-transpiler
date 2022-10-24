import { SyntaxKind } from 'typescript';
import * as ts from 'typescript';


const filename = "tmp.ts";

const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker()

global.src = sourceFile;
global.checker = typeChecker

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
const UNDEFINED_TOKEN = "None";
const IF_TOKEN = "if";
const ELSE_TOKEN = "else";
const ELSEIF_TOKEN = "elif";
const THIS_TOKEN = "self";
const SLASH_TOKEN = "/";
const ASTERISK_TOKEN = "*";
const PLUS_TOKEN = "+";
const MINUS_TOKEN = "-";
const RETURN_TOKEN = "return";
const OBJECT_OPENING = "{";
const OBJECT_CLOSING = "}";
const LEFT_PARENTHESIS = "(";
const RIGHT_PARENTHESIS = ")";
const LEFT_ARRAY_OPENING = "[";
const RIGHT_ARRAY_CLOSING = "]";
const TRUE_KEYWORD = "True";
const FALSE_KEYWORD = "False";
const NEW_CORRESPODENT = "new";
const THROW_TOKEN = "raise";
const AWAIT_TOKEN = "await";
const STATIC_TOKEN = "static";
const ASYNC_TOKEN =  "async";
const EXTENDS_TOKEN = "extends";
const NOT_TOKEN = "not";
const SUPER_TOKEN = "super()";
const PROPERTY_ACCESS_TOKEN = ".";
const TRY_TOKEN = "try:";
const CATCH_TOKEN = "except";
const CATCH_OPEN = "";
const CATCH_CLOSE = ":";
const TRY_CONDITION_OPEN_TOKEN = "";
const BREAK_TOKEN = "break";

const SupportedKindNames = {
    [ts.SyntaxKind.StringLiteral]: "StringLiteral",
    [ts.SyntaxKind.StringKeyword]: "String",
    [ts.SyntaxKind.NumberKeyword]: "Number",
    [ts.SyntaxKind.MinusMinusToken]: "--",
    [ts.SyntaxKind.MinusToken]: "-",
    [ts.SyntaxKind.SlashToken]: "/",
    [ts.SyntaxKind.AsteriskToken]: "*",
    [ts.SyntaxKind.InKeyword]: "in",
    [ts.SyntaxKind.PlusToken]: "+",
    [ts.SyntaxKind.PercentToken]: "%",
    [ts.SyntaxKind.LessThanToken]: "<",
    [ts.SyntaxKind.LessThanEqualsToken]: "<=",
    [ts.SyntaxKind.GreaterThanToken]: ">",
    [ts.SyntaxKind.GreaterThanEqualsToken]: ">=",
    [ts.SyntaxKind.EqualsEqualsToken]: "==",
    [ts.SyntaxKind.EqualsEqualsEqualsToken]: "==",
    [ts.SyntaxKind.EqualsToken]: "=", 
    [ts.SyntaxKind.PlusEqualsToken]: "+=",
    [ts.SyntaxKind.BarBarToken]: "or",
    [ts.SyntaxKind.AmpersandAmpersandToken]: "and",
    [ts.SyntaxKind.ExclamationEqualsEqualsToken]: "!=",
    [ts.SyntaxKind.ExclamationEqualsToken]: "!=",
    [ts.SyntaxKind.AsyncKeyword]: ASYNC_TOKEN,
    [ts.SyntaxKind.AwaitKeyword]: AWAIT_TOKEN,
    [ts.SyntaxKind.StaticKeyword]: STATIC_TOKEN,
}

const PostFixOperators = {
    [ts.SyntaxKind.PlusPlusToken]: "++",
    [ts.SyntaxKind.MinusMinusToken]: "--",
}

const PrefixFixOperators = {
    [ts.SyntaxKind.ExclamationToken]: NOT_TOKEN,
    [ts.SyntaxKind.MinusToken]: "-",
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
        return UNDEFINED_TOKEN;
    }
    return idValue; // check this later
}

function shouldRemoveParenthesisFromCallExpression(node) {

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

function printInstanceOfExpression(node, identation) {
    const left = printNode(node.left, 0);
    const right = printNode(node.right, 0);
    return getIden(identation) + `isinstance(${left}, ${right})`;
}

function printBinaryExpression(node, identation) {
    const {left, right, operatorToken} = node;

    if (operatorToken.kind == ts.SyntaxKind.InstanceOfKeyword) {
        return printInstanceOfExpression(node, identation);
    }

    const leftVar = printNode(left, 0)

    const rightVar = printNode(right, identation)

    const operator = SupportedKindNames[operatorToken.kind];

    return getIden(identation) + leftVar +" "+ operator + " " + rightVar.trim();
}


function printPropertyAccessExpression(node, identation) {

    const expression = node.expression;

    let leftSide = printNode(expression, 0);
    let rightSide = node.name.escapedText;

    const idType = global.checker.getTypeAtLocation(node.expression);

    leftSide = PropertyAccessReplacements[leftSide] ?? leftSide;
    // checking "toString" insde the object will return the builtin toString method :X
    rightSide = (rightSide !== 'toString' && rightSide !== 'length' && PropertyAccessReplacements[rightSide]) ? PropertyAccessReplacements[rightSide] : rightSide;
    
    let rawExpression = leftSide + PROPERTY_ACCESS_TOKEN + rightSide;
    

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
                    name: (name as any).escapedText,
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
            return getIden(funcBodyIdentation )  + "return " + printNode(s.expression, 0);
        }

        return printNode(s, funcBodyIdentation);

    }).filter((s)=>!!s).join("\n");

    functionDef += statementsAsString;

    return functionDef;
}

function printMethodDeclaration(node, identation) {

    // get comments
    const commentPosition = ts.getCommentRange(node)
    const comment = global.src.getFullText().slice(commentPosition.pos, commentPosition.end);

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
        return printNode(s, funcBodyIdentation);

    }).filter((s)=>!!s).join("\n");

    functionDef += statementsAsString + '\n';

    return functionDef;
}

function printStringLiteral(node) {
    return "'" + node.text.replace("'", "\\'") + "'";
}

function printNumericLiteral(node) {
    return node.text;
}

function printArrayLiteralExpression(node) {

    const elements = node.elements.map((e) => {
        return printNode(e);
    }).join(", ");
    return LEFT_ARRAY_OPENING + elements + RIGHT_ARRAY_CLOSING;
}

function printVariableDeclarationList(node,identation) {
    const declaration = node.declarations[0];
    // const name = declaration.name.escapedText;
    const parsedValue = printNode(declaration.initializer, identation);
    return getIden(identation) + printNode(declaration.name) + " = " + parsedValue.trim();
}

function printVariableStatement(node, identation){
    const decList = node.declarationList;
    return printVariableDeclarationList(decList, identation);

}

function printOutOfOrderCallExpressionIfAny(node, identation) {
    const expressionText = node.expression.getText();
    const args = node.arguments;
    let finalExpression = undefined;
    switch (expressionText) {
        case "Array.isArray":
            finalExpression = "isinstance(" + printNode(args[0], 0) + ", list)";
            break;
        case "Math.floor":
            finalExpression = "int(math.floor(" + printNode(args[0], 0) + "))";
            break;
        case "Object.keys":
            finalExpression = "list(" + printNode(args[0], 0) + ".keys())";
            break;
        case "Object.values":
            finalExpression = "list(" + printNode(args[0], 0) + ".values())";
            break;
        case "Math.round":
            finalExpression = "int(math.round(" + printNode(args[0], 0) + "))";
        case "Math.ceil":
            finalExpression = "int(math.ceil(" + printNode(args[0], 0) + "))";
    }
    if (finalExpression) {
        return getIden(identation) + finalExpression;
    }
    return undefined
}

function printCallExpression(node, identation) {

    const expression = node.expression
    const args = node.arguments;
    
    const removeParenthesis = shouldRemoveParenthesisFromCallExpression(node);

    let finalExpression = printOutOfOrderCallExpressionIfAny(node, identation);

    if (finalExpression) {
        return getIden(identation) + finalExpression;
    }

    const parsedExpression = printNode(expression, 0);
    
    let parsedCall = getIden(identation) + parsedExpression;
    if (!removeParenthesis) {
        const parsedArgs = args.map((a) => {
            return printNode(a, identation).trim();
        }).join(",")
        parsedCall+= "(" + parsedArgs + ")";
    
    }    
    return parsedCall;
}

function printClass(node, identation) {
    const className = node.name.escapedText;
    const heritageClauses = node.heritageClauses;

    let classInit = "";
    if (heritageClauses !== undefined) {
        const classExtends = heritageClauses[0].types[0].expression.escapedText;
        classInit = getIden(identation) + "class " + className + "(" + classExtends + "):\n";
    } else {
        classInit = getIden(identation) + "class " + className + ":\n";
    }

    const classBody = node.members.map((m)=> {
        return printNode(m, identation+1);
    }).join("\n") 

    return classInit + classBody;
}

function printWhileStatement(node, identation) {
    const loopExpression = node.expression;

    const expression = printNode(loopExpression, 0);
    
    return getIden(identation) + "while "+ expression +":\n" + node.statement.statements.map(st => printNode(st, identation+1)).join("\n");
}

function printForStatement(node, identation) {
    // currently only let i =0 ; i< 20; i++ is supported
    const varName = node.initializer.declarations[0].name.escapedText; 
    const initValue = printNode(node.initializer.declarations[0].initializer, 0)
    const roofValue = printNode(node.condition.right,0)

    return getIden(identation) + "for " + varName + " in range(" + initValue + ", " + roofValue + "):\n" + node.statement.statements.map(st => printNode(st, identation+1)).join("\n");
}

function printBreakStatement(node, identation) {
    return getIden(identation) + BREAK_TOKEN;
}

function printPostFixUnaryExpression(node, identation) {
    const {operand, operator} = node;
    return getIden(identation) + printNode(operand, 0) + PostFixOperators[operator]; 
}

function printPrefixUnaryExpression(node, identation) {
    const {operand, operator} = node;
    return getIden(identation) + PrefixFixOperators[operator] + printNode(operand, 0); 
}

function printObjectLiteralExpression(node, identation) {
    const objectBody = node.properties.map((p) => printNode(p, identation+1)).join(",\n");

    return  OBJECT_OPENING + "\n" + objectBody + "\n" +  getIden(identation) + OBJECT_CLOSING;
}

function printPropertyAssignment(node, identation) {
    const {name, initializer} = node;
    const nameAsString = printNode(name, 0);
    const valueAsString = printNode(initializer, identation);

    return getIden(identation) + nameAsString + ": " + valueAsString.trim();
}

function printElementAccessExpressionExceptionIfAny(node) {
    if (node.expression.kind === SyntaxKind.ThisKeyword) {
        return "getattr(self, " + printNode(node.argumentExpression, 0) + ")";
    }
}

function printElementAccessExpression(node, identation) {
    // example x['test']
    const {expression, argumentExpression} = node;

    const exception = printElementAccessExpressionExceptionIfAny(node);
    if (exception) {
        return exception;
    }
    const expressionAsString = printNode(expression, 0);
    const argumentAsString = printNode(argumentExpression, 0);
    return expressionAsString + "[" + argumentAsString + "]";
}

function printIfStatement(node, identation) {
    const expression = printNode(node.expression, 0)
    const ifBody = node.thenStatement.statements.map((s) => printNode(s, identation+1)).join("\n");

    const isElseIf = node.parent.kind === ts.SyntaxKind.IfStatement;

    const prefix = isElseIf ? ELSEIF_TOKEN : IF_TOKEN;

    let ifComplete  =  getIden(identation) + prefix + " " + expression + ":\n" + ifBody + "\n";

    const elseStatement = node.elseStatement

    if (elseStatement?.kind === ts.SyntaxKind.Block) {
        const elseBody = getIden(identation) + ELSE_TOKEN + ':\n' + elseStatement.statements.map((s) => printNode(s, identation+1)).join("\n");
        ifComplete += elseBody;
    } else if (elseStatement?.kind === ts.SyntaxKind.IfStatement) {
        const elseBody = printIfStatement(elseStatement, identation);
        ifComplete += elseBody;
    }

    return ifComplete;
}

function printParenthesizedExpression(node, identation) {
    return getIden(identation) + LEFT_PARENTHESIS + printNode(node.expression, 0) + RIGHT_PARENTHESIS;
}

function printBooleanLiteral(node) {
    if (ts.SyntaxKind.TrueKeyword === node.kind) {
        return TRUE_KEYWORD;
    }
    return FALSE_KEYWORD;
}

function printTryStatement(node, identation) {
    const tryBody = node.tryBlock.statements.map((s) => printNode(s, identation+1)).join("\n");
    const catchBody = node.catchClause.block.statements.map((s) => printNode(s, identation+1)).join("\n");
    const catchDeclaration = " Exception as " + node.catchClause.variableDeclaration.name.escapedText;
    return getIden(identation) + TRY_TOKEN + "\n" + tryBody + "\n" + getIden(identation) + CATCH_TOKEN + CATCH_OPEN + catchDeclaration + CATCH_CLOSE + "\n" + catchBody;
}

function printNewExpression(node, identation) {
    const expression =  printNode(node.expression, 0)
    const args = node.arguments.map(n => printNode(n, 0)).join(",")
    return expression + LEFT_PARENTHESIS + args + RIGHT_PARENTHESIS;
}

function printThrowStatement(node, identation) {
    const expression = printNode(node.expression, 0);
    return getIden(identation) + THROW_TOKEN + " " + expression;
}

function printAwaitExpression(node, identation) {
    const expression = printNode(node.expression, 0);
    return getIden(identation) + AWAIT_TOKEN + " " + expression;
}

function printConditionalExpression(node, identation) {
    const condition = printNode(node.condition, 0);
    const whenTrue = printNode(node.whenTrue, 0);
    const whenFalse = printNode(node.whenFalse, 0);

    return getIden(identation) + whenTrue + " if " + condition + " else " + whenFalse;
}

function printAsExpression(node, identation) {
    return printNode(node.expression, identation)
}

function printReturnStatement(node, identation) {
    const exp =  node.expression
    const rightPart = exp ? (' ' + printNode(exp, identation)) : '';
    return getIden(identation) + RETURN_TOKEN + ' ' + rightPart.trim();
}

function printArrayBindingPattern(node, identation) {
    const elements = node.elements.map((e) => printNode(e.name, identation)).join(", ");
    return getIden(identation) + LEFT_ARRAY_OPENING + elements + RIGHT_ARRAY_CLOSING;
}

function printNode(node, identation = 0) {

    if(ts.isExpressionStatement(node)) {
        // return printExpressionStatement(node.expression, identation);
        return printNode(node.expression, identation);
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
        return printElementAccessExpression(node, identation);
    } else if (ts.isIfStatement(node)) {
        return printIfStatement(node, identation);
    } else if (ts.isParenthesizedExpression(node)) {
        return printParenthesizedExpression(node, identation);
    } else if ((ts as any).isBooleanLiteral(node)) {
        return printBooleanLiteral(node);
    } else if (ts.SyntaxKind.ThisKeyword === node.kind) {
        return THIS_TOKEN;
    } else if (ts.SyntaxKind.SuperKeyword === node.kind) {
        return SUPER_TOKEN;
    }else if (ts.isTryStatement(node)){
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
    } else if (ts.isAsExpression(node)) {
        return printAsExpression(node, identation);
    } else if (ts.isReturnStatement(node)) {
        return printReturnStatement(node, identation);
    } else if (ts.isArrayBindingPattern(node)) {
        return printArrayBindingPattern(node, identation);
    }

    if (node.statements) {
        const transformedStatements = node.statements.map((m)=> {
            return printNode(m, identation + 1);
        });

        return transformedStatements.join("\n");
    }
    return "";
}

const res = printNode(sourceFile,-1);
console.log(res);