const ts = require('typescript');

const code = `
console.log('hello world')
function giveMessage(message: string): string {
    return "compiling message will be: " + message;
}

giveMessage("how are you");
`;

let generatedCode = "";

const SupportedKindNames = {
    [ts.SyntaxKind.StringLiteral]: "StringLiteral",
    [ts.SyntaxKind.StringKeyword]: "String",
    [ts.SyntaxKind.NumberKeyword]: "Number",
    [ts.SyntaxKind.PlusToken]: "+"
}

const FunctionDefSupportedKindNames = {
    [ts.SyntaxKind.StringKeyword]: "&str"
};

const sourceFile = ts.createSourceFile('temp.ts', code);


function getIdentifierValueKind(identifier) {
  //  console.log("here?");
    if (identifier.kind === ts.SyntaxKind.StringLiteral) {
        return `"${identifier.text}".to_owned()`;
    }
    if (identifier.kind === ts.SyntaxKind.Identifier) {
        return "&" + identifier.escapedText
    }

    return "";
}

function printBinaryExpression({left, right, operatorToken}) {
//    console.log("----Binary expression------");
//    console.log("left->", left, "--right->",right, "--->operator",operatorToken);

    const leftVar = getIdentifierValueKind(left);
    const rightVar = getIdentifierValueKind(right);

    const operator = SupportedKindNames[operatorToken.kind];
//    console.log(`will combine "${leftVar.value}"" and "${rightVar.variable}"" with operator ${operator}`);

    return leftVar +" "+ operator + " " + rightVar + ";\n";
}

function extractPropertyAccessExpression(expressionStatement) {
    const {expression, name} = expressionStatement;
    //console.log("child identifier", expression.escapedText);
    //console.log("--- IdentifierObject", name.escapedText);

    // the known keywords we could map
    if (expression.escapedText === "console") {
        return "println!";
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
//    console.log("WHERE!!!!!!", expressionStatement);

    if (expressionStatement.kind === ts.SyntaxKind.CallExpression) {
        const {expression, arguments} = expressionStatement;

        const parsedArgs = parseParameters(arguments, SupportedKindNames).map((a) => {
            return '"' + a.name + '"'// + (a.type === "StringLiteral" ? ".to_owned()" : "")
        }).join(", ");

//        console.log("==========expr statement=args===>", parsedArgs);
        const expressionResult = printExpressionStatement(expression);
        const exprWithParam =  expressionResult + "(" + parsedArgs + ");";

//        console.log("<<<<<<", exprWithParam);
        return exprWithParam;
    }
    // is node object 206
    if (expressionStatement.kind === ts.SyntaxKind.PropertyAccessExpression) {
        // retrieve a name of potentially known function name on a platform
        return extractPropertyAccessExpression(expressionStatement);
    }

//    console.log("function def from mem", expressionStatement);
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
                //console.log("name arg", item);

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
    //console.log("---Function---->", escapedText, parsedArgs, "return TYpe, ", returnType);

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

function printTree(node) {
//    console.log("aaaaaa WHY");
//    const nameDeclaration = ts.getNameOfDeclaration(node);

    if(ts.isExpressionStatement(node)) {
        const expression = node.expression;
      //  console.log("e==>", expression.expression, ", ar=>", expression.arguments);
        const exprString = printExpressionStatement(expression);

//        console.log("ExprString", exprString);
        return exprString;
    } else if (ts.isFunctionDeclaration(node)){
//       console.log("function -<", node);
        return printFunction(node);
    }

    if (node.statements) {
        const transformedStatements = node.statements.map((m)=> {
            return printTree(m);
        });

        return transformedStatements.join("\n");
    }
    return "";
}

const res = printTree(sourceFile);
console.log("-compiled-->\n", res);