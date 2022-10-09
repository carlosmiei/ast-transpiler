const ts = require('typescript');

let code = `
const x = 12;
class Greeter {
    greeting: string;
    
    teste() {
        console.log("Hello, " + this.greeting);
    }
}
console.log('hello world')
function giveMessage(message: string): string {
    return "compiling message will be: " + message;
}

giveMessage("how are you");
`;

code = `
class Greeter {
    
    teste() {
        console.log("Hello");
    }
}
`;


global.code = code;
let generatedCode = "";

const SupportedKindNames = {
    [ts.SyntaxKind.StringLiteral]: "StringLiteral",
    [ts.SyntaxKind.StringKeyword]: "String",
    [ts.SyntaxKind.NumberKeyword]: "Number",
    [ts.SyntaxKind.PlusToken]: "+"
}

const FunctionDefSupportedKindNames = {
    [ts.SyntaxKind.StringKeyword]: "string"
};

var sourceFile = ts.createSourceFile('temp.ts', code);

global.sourceFile = sourceFile;

function getIden (num) {
    return " ".repeat(num);
}


function getIdentifierValueKind(identifier) {
    // if (identifier.kind === ts.SyntaxKind.StringLiteral) {
    //     return `"${identifier.text}".to_owned()`;
    // }
    if (identifier.kind === ts.SyntaxKind.Identifier) {
        return "&" + identifier.escapedText
    }

    return "";
}

function printBinaryExpression({left, right, operatorToken}) {

    const leftVar = getIdentifierValueKind(left);
    const rightVar = getIdentifierValueKind(right);

    const operator = SupportedKindNames[operatorToken.kind];

    return leftVar +" "+ operator + " " + rightVar + ";\n";
}

function extractPropertyAccessExpression(expressionStatement) {
const {expression, name} = expressionStatement;
    //console.log("child identifier", expression.escapedText);
    //console.log("--- IdentifierObject", name.escapedText);

    // the known keywords we could map
    if (expression.escapedText === "console") {
        return "print";
    }

    return expression.escapedText;
}

/**
 * @params {ts.Expression} expression
 *
 * */
function printExpressionStatement(expressionStatement) {

    if (expressionStatement.kind === ts.SyntaxKind.BinaryExpression) {
        const binaryExpressionString =  printBinaryExpression(expressionStatement);
        return binaryExpressionString;
    }

    if (expressionStatement.kind === ts.SyntaxKind.CallExpression) {
        const {expression, arguments} = expressionStatement;

        const parsedArgs = parseParameters(arguments, SupportedKindNames).map((a) => {
            return '"' + a.name + '"'// + (a.type === "StringLiteral" ? ".to_owned()" : "")
        }).join(", ");

        const expressionResult = printExpressionStatement(expression);
        const exprWithParam =  expressionResult + "(" + parsedArgs + ");";

        return exprWithParam;
    }
    // is node object 206
    if (expressionStatement.kind === ts.SyntaxKind.PropertyAccessExpression) {
        // retrieve a name of potentially known function name on a platform
        return extractPropertyAccessExpression(expressionStatement);
    }

    if (expressionStatement.kind === ts.SyntaxKind.Identifier) {
        return expressionStatement.escapedText;
    }
    console.log("should never be here", expressionStatement);
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
                    type: kindNames[token.kind]
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

function printMethodDeclaration(node, indentation) {
    const { name:{ escapedText }, parameters, body, type: returnType} = node;

    const parsedArgs = (parameters.length > 0) ? parseParameters(parameters, FunctionDefSupportedKindNames) : [];

    const parsedArgsAsString = parsedArgs.map((a) => {
        return `${a.name}: ${a.type}`
    }).join(", ");

    let functionDef = "def " + escapedText
        + "(" + parsedArgsAsString + ")"
        + ":\n"
        // // NOTE - must have function RETURN TYPE in TS
        // + SupportedKindNames[returnType.kind]
        // +" {\n";

    const statementsAsString = body.statements.map((s) => {
        if (s.kind === ts.SyntaxKind.ReturnStatement) {
//            console.log("this function returns data");
            const exprString = printExpressionStatement(s.expression, indentation + 1);
            return "  return " + exprString
        }

        // unknown stuff at this point
        return printTree(s, indentation+1);
    }).filter((s)=>!!s).join("");

    functionDef += statementsAsString;

    return functionDef;
}


function printClass(node, identation) {
    const className = node.name.escapedText;
    const classInit = "class " + className + ":\n";
    
    const classBody = node.members.map((m)=> {
        return printTree(m, identation+1);
    }).join("\n") 

    return classInit + classBody;
}

function printTree(node, identation) {

    if(ts.isExpressionStatement(node)) {
        const expression = node.expression;
        const exprString = printExpressionStatement(expression, indentation);

        return exprString;
    } else if (ts.isFunctionDeclaration(node)){
        return printFunction(node, identation);
    } else if (ts.isClassDeclaration(node)) {
        return printClass(node, indentation) 
    } else if (ts.isVariableStatement(node)) {
        node.getLeadingTriviaWidth(global.sourceFile)
        const varType = node.declarationList.flags;
        const declarations = node.declarationList.declarations;
        // declarations.
        console.log("variable statement");
        let y = []
        declarations.forEach((s) => {
            
            y.push(s)
            let init = s.initializer;
            // console.log(s.name.escapedText)
        })
    } else if (ts.isMethodDeclaration(node)) {
        return printMethodDeclaration(node, identation) 
    }

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