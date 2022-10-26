import ts from 'typescript';
const SyntaxKind = ts.SyntaxKind;
const filename = "tmp.ts";
const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker();
global.src = sourceFile;
global.checker = typeChecker;
const FunctionDefSupportedKindNames = {
    [ts.SyntaxKind.StringKeyword]: "string"
};
class BaseTranspiler {
    constructor(config) {
        this.DEFAULT_IDENTATION = "    ";
        this.UNDEFINED_TOKEN = "None";
        this.IF_TOKEN = "if";
        this.ELSE_TOKEN = "else";
        this.ELSEIF_TOKEN = "elif";
        this.THIS_TOKEN = "self";
        this.SLASH_TOKEN = "/";
        this.ASTERISK_TOKEN = "*";
        this.PLUS_TOKEN = "+";
        this.MINUS_TOKEN = "-";
        this.EQUALS_TOKEN = "=";
        this.EQUALS_EQUALS_TOKEN = "==";
        this.EXCLAMATION_EQUALS_TOKEN = "!=";
        this.AMPERSTAND_APERSAND_TOKEN = "and";
        this.PLUS_EQUALS = "+=";
        this.BAR_BAR_TOKEN = "or";
        this.PERCENT_TOKEN = "%";
        this.RETURN_TOKEN = "return";
        this.OBJECT_OPENING = "{";
        this.OBJECT_CLOSING = "}";
        this.LEFT_PARENTHESIS = "(";
        this.RIGHT_PARENTHESIS = ")";
        this.LEFT_ARRAY_OPENING = "[";
        this.RIGHT_ARRAY_CLOSING = "]";
        this.TRUE_KEYWORD = "True";
        this.FALSE_KEYWORD = "False";
        this.NEW_CORRESPODENT = "new";
        this.THROW_TOKEN = "raise";
        this.AWAIT_TOKEN = "await";
        this.STATIC_TOKEN = "static";
        this.ASYNC_TOKEN = "async";
        this.EXTENDS_TOKEN = "extends";
        this.NOT_TOKEN = "not";
        this.SUPER_TOKEN = "super()";
        this.PROPERTY_ACCESS_TOKEN = ".";
        this.TRY_TOKEN = "try:";
        this.CATCH_TOKEN = "except";
        this.CATCH_OPEN = "";
        this.CATCH_CLOSE = ":";
        this.TRY_CONDITION_OPEN_TOKEN = "";
        this.BREAK_TOKEN = "break";
        this.IN_TOKEN = "in";
        this.LESS_THAN_TOKEN = "<";
        this.GREATER_THAN_TOKEN = ">";
        this.GREATER_THAN_EQUALS_TOKEN = ">=";
        this.LESS_THAN_EQUALS_TOKEN = "<=";
        this.PLUS_PLUS_TOKEN = "++";
        this.MINUS_MINUS_TOKEN = "--";
        this.WHILE_TOKEN = "while";
        this.WHILE_COND_OPEN = "";
        this.WHILE_COND_CLOSE = ":";
        this.WHILE_CLOSE = "";
        this.FOR_TOKEN = "for";
        this.PROPERTY_ASSIGNMENT_TOKEN = ":";
        this.IF_COND_CLOSE = ":";
        this.IF_COND_OPEN = "(";
        this.IF_CLOSE = "";
        this.IF_OPEN = "";
        this.ELSE_OPEN_TOKEN = "";
        this.ELSE_CLOSE_TOKEN = "";
        this.SupportedKindNames = {};
        this.PostFixOperators = {};
        this.PrefixFixOperators = {};
        this.FunctionDefSupportedKindNames = {};
        this.PropertyAccessReplacements = {};
        Object.assign(this, config);
        this.initOperators();
    }
    initOperators() {
        this.SupportedKindNames = {
            [ts.SyntaxKind.StringLiteral]: "StringLiteral",
            [ts.SyntaxKind.StringKeyword]: "String",
            [ts.SyntaxKind.NumberKeyword]: "Number",
            [ts.SyntaxKind.MinusMinusToken]: this.MINUS_MINUS_TOKEN,
            [ts.SyntaxKind.MinusToken]: this.MINUS_TOKEN,
            [ts.SyntaxKind.SlashToken]: this.SLASH_TOKEN,
            [ts.SyntaxKind.AsteriskToken]: this.ASTERISK_TOKEN,
            [ts.SyntaxKind.InKeyword]: this.IN_TOKEN,
            [ts.SyntaxKind.PlusToken]: this.PLUS_TOKEN,
            [ts.SyntaxKind.PercentToken]: this.PERCENT_TOKEN,
            [ts.SyntaxKind.LessThanToken]: this.LESS_THAN_TOKEN,
            [ts.SyntaxKind.LessThanEqualsToken]: this.LESS_THAN_EQUALS_TOKEN,
            [ts.SyntaxKind.GreaterThanToken]: this.GREATER_THAN_TOKEN,
            [ts.SyntaxKind.GreaterThanEqualsToken]: this.GREATER_THAN_EQUALS_TOKEN,
            [ts.SyntaxKind.EqualsEqualsToken]: this.EQUALS_EQUALS_TOKEN,
            [ts.SyntaxKind.EqualsEqualsEqualsToken]: this.EQUALS_EQUALS_TOKEN,
            [ts.SyntaxKind.EqualsToken]: this.EQUALS_TOKEN,
            [ts.SyntaxKind.PlusEqualsToken]: this.PLUS_EQUALS,
            [ts.SyntaxKind.BarBarToken]: this.BAR_BAR_TOKEN,
            [ts.SyntaxKind.AmpersandAmpersandToken]: this.AMPERSTAND_APERSAND_TOKEN,
            [ts.SyntaxKind.ExclamationEqualsEqualsToken]: this.EXCLAMATION_EQUALS_TOKEN,
            [ts.SyntaxKind.ExclamationEqualsToken]: this.EXCLAMATION_EQUALS_TOKEN,
            [ts.SyntaxKind.AsyncKeyword]: this.ASYNC_TOKEN,
            [ts.SyntaxKind.AwaitKeyword]: this.AWAIT_TOKEN,
            [ts.SyntaxKind.StaticKeyword]: this.STATIC_TOKEN,
        };
        this.PostFixOperators = {
            [ts.SyntaxKind.PlusPlusToken]: this.PLUS_PLUS_TOKEN,
            [ts.SyntaxKind.MinusMinusToken]: this.MINUS_MINUS_TOKEN,
        };
        this.PrefixFixOperators = {
            [ts.SyntaxKind.ExclamationToken]: this.NOT_TOKEN,
            [ts.SyntaxKind.MinusToken]: this.MINUS_TOKEN,
        };
    }
    getIden(num) {
        return this.DEFAULT_IDENTATION.repeat(num);
    }
    getIdentifierValueKind(identifier) {
        var _a;
        const idValue = (_a = identifier.text) !== null && _a !== void 0 ? _a : identifier.escapedText;
        if (idValue === "undefined") {
            return this.UNDEFINED_TOKEN;
        }
        return idValue; // check this later
    }
    shouldRemoveParenthesisFromCallExpression(node) {
        if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const propertyAccessExpression = node.expression;
            const propertyAccessExpressionName = propertyAccessExpression.name.text;
            if (propertyAccessExpressionName === "length"
                || propertyAccessExpressionName === "toString") { // add more exceptions here
                return true;
            }
        }
        return false;
    }
    printInstanceOfExpression(node, identation) {
        const left = this.printNode(node.left, 0);
        const right = this.printNode(node.right, 0);
        return this.getIden(identation) + `isinstance(${left}, ${right})`;
    }
    printBinaryExpression(node, identation) {
        const { left, right, operatorToken } = node;
        if (operatorToken.kind == ts.SyntaxKind.InstanceOfKeyword) {
            return this.printInstanceOfExpression(node, identation);
        }
        const leftVar = this.printNode(left, 0);
        const rightVar = this.printNode(right, identation);
        const operator = this.SupportedKindNames[operatorToken.kind];
        return this.getIden(identation) + leftVar + " " + operator + " " + rightVar.trim();
    }
    printPropertyAccessExpression(node, identation) {
        var _a;
        const expression = node.expression;
        let leftSide = this.printNode(expression, 0);
        let rightSide = node.name.escapedText;
        const idType = global.checker.getTypeAtLocation(node.expression);
        leftSide = (_a = this.PropertyAccessReplacements[leftSide]) !== null && _a !== void 0 ? _a : leftSide;
        // checking "toString" insde the object will return the builtin toString method :X
        rightSide = (rightSide !== 'toString' && rightSide !== 'length' && this.PropertyAccessReplacements[rightSide]) ? this.PropertyAccessReplacements[rightSide] : rightSide;
        let rawExpression = leftSide + this.PROPERTY_ACCESS_TOKEN + rightSide;
        if (rightSide === "length") {
            // if (checker.isArrayType(idType)) {
            rawExpression = "len(" + leftSide + ")";
            // }
        }
        else if (rightSide === "toString") {
            rawExpression = "str(" + leftSide + ")";
        }
        if (this.PropertyAccessReplacements[rawExpression]) {
            return this.getIden(identation) + this.PropertyAccessReplacements[rawExpression];
        }
        return this.getIden(identation) + rawExpression;
    }
    parseParameters(parameters, kindNames) {
        return parameters
            .map((item) => {
            if (ts.isToken(item)) {
                return {
                    name: item.text,
                    type: kindNames[item.kind]
                };
            }
            const name = ts.getNameOfDeclaration(item);
            const token = item.type;
            return {
                name: name.escapedText,
                type: (token !== undefined) ? kindNames[token.kind] : undefined
            };
        })
            .filter(item => !!item);
    }
    printModifiers(node) {
        const modifiers = node.modifiers;
        if (modifiers === undefined) {
            return "";
        }
        return modifiers.map(item => this.SupportedKindNames[item.kind]).join(" ") + " ";
    }
    printFunction(node, identation) {
        const { name: { escapedText }, parameters, body, type: returnType } = node;
        let parsedArgs = (parameters.length > 0) ? this.parseParameters(parameters, FunctionDefSupportedKindNames) : [];
        const parsedArgsAsString = parsedArgs.map((a) => {
            var _a;
            return `${(_a = a.name) !== null && _a !== void 0 ? _a : a}`;
        }).join(", ");
        let functionDef = this.getIden(identation) + this.printModifiers(node) + "def " + escapedText
            + "(" + parsedArgsAsString + ")"
            + ":\n";
        // // NOTE - must have RETURN TYPE in TS
        // + SupportedKindNames[returnType.kind]
        // +" {\n";
        const funcBodyIdentation = identation + 1;
        const statementsAsString = body.statements.map((s) => {
            return this.printNode(s, funcBodyIdentation);
        }).filter((s) => !!s).join("\n");
        functionDef += statementsAsString;
        return functionDef;
    }
    printMethodDeclaration(node, identation) {
        // get comments
        const commentPosition = ts.getCommentRange(node);
        const comment = global.src.getFullText().slice(commentPosition.pos, commentPosition.end);
        const { name: { escapedText }, parameters, body, type: returnType } = node;
        let parsedArgs = (parameters.length > 0) ? this.parseParameters(parameters, FunctionDefSupportedKindNames) : [];
        parsedArgs.unshift("self");
        const parsedArgsAsString = parsedArgs.map((a) => {
            var _a;
            return `${(_a = a.name) !== null && _a !== void 0 ? _a : a}`;
        }).join(", ");
        let functionDef = this.getIden(identation) + this.printModifiers(node) + "def " + escapedText
            + "(" + parsedArgsAsString + ")"
            + ":\n";
        // // NOTE - must have RETURN TYPE in TS
        // + SupportedKindNames[returnType.kind]
        // +" {\n";
        const funcBodyIdentation = identation + 1;
        const statementsAsString = body.statements.map((s) => {
            return this.printNode(s, funcBodyIdentation);
        }).filter((s) => !!s).join("\n");
        functionDef += statementsAsString + '\n';
        return functionDef;
    }
    printStringLiteral(node) {
        return "'" + node.text.replace("'", "\\'") + "'";
    }
    printNumericLiteral(node) {
        return node.text;
    }
    printArrayLiteralExpression(node) {
        const elements = node.elements.map((e) => {
            return this.printNode(e);
        }).join(", ");
        return this.LEFT_ARRAY_OPENING + elements + this.RIGHT_ARRAY_CLOSING;
    }
    printVariableDeclarationList(node, identation) {
        const declaration = node.declarations[0];
        // const name = declaration.name.escapedText;
        const parsedValue = this.printNode(declaration.initializer, identation);
        return this.getIden(identation) + this.printNode(declaration.name) + " = " + parsedValue.trim();
    }
    printVariableStatement(node, identation) {
        const decList = node.declarationList;
        return this.printVariableDeclarationList(decList, identation);
    }
    printOutOfOrderCallExpressionIfAny(node, identation) {
        return undefined; // stub to override
    }
    printCallExpression(node, identation) {
        const expression = node.expression;
        const args = node.arguments;
        const removeParenthesis = this.shouldRemoveParenthesisFromCallExpression(node);
        let finalExpression = this.printOutOfOrderCallExpressionIfAny(node, identation);
        if (finalExpression) {
            return this.getIden(identation) + finalExpression;
        }
        const parsedExpression = this.printNode(expression, 0);
        let parsedCall = this.getIden(identation) + parsedExpression;
        if (!removeParenthesis) {
            const parsedArgs = args.map((a) => {
                return this.printNode(a, identation).trim();
            }).join(",");
            parsedCall += "(" + parsedArgs + ")";
        }
        return parsedCall;
    }
    printClass(node, identation) {
        const className = node.name.escapedText;
        const heritageClauses = node.heritageClauses;
        let classInit = "";
        if (heritageClauses !== undefined) {
            const classExtends = heritageClauses[0].types[0].expression.escapedText;
            classInit = this.getIden(identation) + "class " + className + "(" + classExtends + "):\n";
        }
        else {
            classInit = this.getIden(identation) + "class " + className + ":\n";
        }
        const classBody = node.members.map((m) => {
            return this.printNode(m, identation + 1);
        }).join("\n");
        return classInit + classBody;
    }
    printWhileStatement(node, identation) {
        const loopExpression = node.expression;
        const expression = this.printNode(loopExpression, 0);
        return this.getIden(identation) +
            this.WHILE_TOKEN + " " +
            this.WHILE_COND_OPEN +
            expression +
            this.WHILE_COND_CLOSE + "\n" +
            node.statement.statements.map(st => this.printNode(st, identation + 1)).join("\n") +
            this.WHILE_CLOSE;
    }
    printForStatement(node, identation) {
        // currently only let i =0 ; i< 20; i++ is supported
        const varName = node.initializer.declarations[0].name.escapedText;
        const initValue = this.printNode(node.initializer.declarations[0].initializer, 0);
        const roofValue = this.printNode(node.condition.right, 0);
        return this.getIden(identation) + this.FOR_TOKEN + " " + varName + " in range(" + initValue + ", " + roofValue + "):\n" + node.statement.statements.map(st => this.printNode(st, identation + 1)).join("\n");
    }
    printBreakStatement(node, identation) {
        return this.getIden(identation) + this.BREAK_TOKEN;
    }
    printPostFixUnaryExpression(node, identation) {
        const { operand, operator } = node;
        return this.getIden(identation) + this.printNode(operand, 0) + this.PostFixOperators[operator];
    }
    printPrefixUnaryExpression(node, identation) {
        const { operand, operator } = node;
        return this.getIden(identation) + this.PrefixFixOperators[operator] + this.printNode(operand, 0);
    }
    printObjectLiteralExpression(node, identation) {
        const objectBody = node.properties.map((p) => this.printNode(p, identation + 1)).join(",\n");
        return this.OBJECT_OPENING + "\n" + objectBody + "\n" + this.getIden(identation) + this.OBJECT_CLOSING;
    }
    printPropertyAssignment(node, identation) {
        const { name, initializer } = node;
        const nameAsString = this.printNode(name, 0);
        const valueAsString = this.printNode(initializer, identation);
        return this.getIden(identation) + nameAsString + this.PROPERTY_ASSIGNMENT_TOKEN + " " + valueAsString.trim();
    }
    printElementAccessExpressionExceptionIfAny(node) {
        return undefined; // stub to override
    }
    printElementAccessExpression(node, identation) {
        // example x['test']
        const { expression, argumentExpression } = node;
        const exception = this.printElementAccessExpressionExceptionIfAny(node);
        if (exception) {
            return exception;
        }
        const expressionAsString = this.printNode(expression, 0);
        const argumentAsString = this.printNode(argumentExpression, 0);
        return expressionAsString + "[" + argumentAsString + "]";
    }
    printIfStatement(node, identation) {
        const expression = this.printNode(node.expression, 0);
        const ifBody = node.thenStatement.statements.map((s) => this.printNode(s, identation + 1)).join("\n");
        const isElseIf = node.parent.kind === ts.SyntaxKind.IfStatement;
        const prefix = isElseIf ? this.ELSEIF_TOKEN : this.IF_TOKEN;
        const ifEnd = this.IF_CLOSE ? this.getIden(identation) + this.IF_CLOSE : "";
        let ifComplete = this.getIden(identation) + prefix + " " + this.IF_COND_OPEN + expression + this.IF_COND_CLOSE + this.IF_OPEN + "\n" + ifBody + "\n" + ifEnd;
        const elseStatement = node.elseStatement;
        if ((elseStatement === null || elseStatement === void 0 ? void 0 : elseStatement.kind) === ts.SyntaxKind.Block) {
            const elseOpen = this.ELSE_OPEN_TOKEN ? " " + this.ELSE_OPEN_TOKEN : "";
            const elseClose = this.ELSE_CLOSE_TOKEN ? this.getIden(identation) + this.ELSE_CLOSE_TOKEN : "";
            const elseBody = this.getIden(identation) + this.ELSE_TOKEN + elseOpen + '\n' + elseStatement.statements.map((s) => this.printNode(s, identation + 1)).join("\n") + elseClose;
            ifComplete += elseBody;
        }
        else if ((elseStatement === null || elseStatement === void 0 ? void 0 : elseStatement.kind) === ts.SyntaxKind.IfStatement) {
            const elseBody = this.printIfStatement(elseStatement, identation);
            ifComplete += elseBody.trim();
        }
        return ifComplete;
    }
    printParenthesizedExpression(node, identation) {
        return this.getIden(identation) + this.LEFT_PARENTHESIS + this.printNode(node.expression, 0) + this.RIGHT_PARENTHESIS;
    }
    printBooleanLiteral(node) {
        if (ts.SyntaxKind.TrueKeyword === node.kind) {
            return this.TRUE_KEYWORD;
        }
        return this.FALSE_KEYWORD;
    }
    printTryStatement(node, identation) {
        const tryBody = node.tryBlock.statements.map((s) => this.printNode(s, identation + 1)).join("\n");
        const catchBody = node.catchClause.block.statements.map((s) => this.printNode(s, identation + 1)).join("\n");
        const catchDeclaration = " Exception as " + node.catchClause.variableDeclaration.name.escapedText;
        return this.getIden(identation) + this.TRY_TOKEN + "\n" + tryBody + "\n" + this.getIden(identation) + this.CATCH_TOKEN + this.CATCH_OPEN + catchDeclaration + this.CATCH_CLOSE + "\n" + catchBody;
    }
    printNewExpression(node, identation) {
        const expression = this.printNode(node.expression, 0);
        const args = node.arguments.map(n => this.printNode(n, 0)).join(",");
        return expression + this.LEFT_PARENTHESIS + args + this.RIGHT_PARENTHESIS;
    }
    printThrowStatement(node, identation) {
        const expression = this.printNode(node.expression, 0);
        return this.getIden(identation) + this.THROW_TOKEN + " " + expression;
    }
    printAwaitExpression(node, identation) {
        const expression = this.printNode(node.expression, 0);
        return this.getIden(identation) + this.AWAIT_TOKEN + " " + expression;
    }
    printConditionalExpression(node, identation) {
        const condition = this.printNode(node.condition, 0);
        const whenTrue = this.printNode(node.whenTrue, 0);
        const whenFalse = this.printNode(node.whenFalse, 0);
        return this.getIden(identation) + whenTrue + " if " + condition + " else " + whenFalse;
    }
    printAsExpression(node, identation) {
        return this.printNode(node.expression, identation);
    }
    printReturnStatement(node, identation) {
        const exp = node.expression;
        const rightPart = exp ? (' ' + this.printNode(exp, identation)) : '';
        return this.getIden(identation) + this.RETURN_TOKEN + ' ' + rightPart.trim();
    }
    printArrayBindingPattern(node, identation) {
        const elements = node.elements.map((e) => this.printNode(e.name, identation)).join(", ");
        return this.getIden(identation) + this.LEFT_ARRAY_OPENING + elements + this.RIGHT_ARRAY_CLOSING;
    }
    myBase() {
        console.log("myBase");
    }
    callMethod() {
        this.myBase();
    }
    printNode(node, identation = 0) {
        if (ts.isExpressionStatement(node)) {
            // return printExpressionStatement(node.expression, identation);
            return this.printNode(node.expression, identation);
        }
        else if (ts.isFunctionDeclaration(node)) {
            return this.printFunction(node, identation);
        }
        else if (ts.isClassDeclaration(node)) {
            return this.printClass(node, identation);
        }
        else if (ts.isVariableStatement(node)) {
            return this.printVariableStatement(node, identation);
        }
        else if (ts.isMethodDeclaration(node)) {
            return this.printMethodDeclaration(node, identation);
        }
        else if (ts.isStringLiteral(node)) {
            return this.printStringLiteral(node);
        }
        else if (ts.isNumericLiteral(node)) {
            return this.printNumericLiteral(node);
        }
        else if (ts.isPropertyAccessExpression(node)) {
            return this.printPropertyAccessExpression(node, identation);
        }
        else if (ts.isArrayLiteralExpression(node)) {
            return this.printArrayLiteralExpression(node);
        }
        else if (ts.isCallExpression(node)) {
            return this.printCallExpression(node, identation);
        }
        else if (ts.isWhileStatement(node)) {
            return this.printWhileStatement(node, identation);
        }
        else if (ts.isBinaryExpression(node)) {
            return this.printBinaryExpression(node, identation);
        }
        else if (ts.isBreakStatement(node)) {
            return this.printBreakStatement(node, identation);
        }
        else if (ts.isForStatement(node)) {
            return this.printForStatement(node, identation);
        }
        else if (ts.isPostfixUnaryExpression(node)) {
            return this.printPostFixUnaryExpression(node, identation);
        }
        else if (ts.isVariableDeclarationList(node)) {
            return this.printVariableDeclarationList(node, identation); // statements are slightly different if inside a for
        }
        else if (ts.isObjectLiteralExpression(node)) {
            return this.printObjectLiteralExpression(node, identation);
        }
        else if (ts.isPropertyAssignment(node)) {
            return this.printPropertyAssignment(node, identation);
        }
        else if (ts.isIdentifier(node)) {
            return this.getIdentifierValueKind(node);
        }
        else if (ts.isElementAccessExpression(node)) {
            return this.printElementAccessExpression(node, identation);
        }
        else if (ts.isIfStatement(node)) {
            return this.printIfStatement(node, identation);
        }
        else if (ts.isParenthesizedExpression(node)) {
            return this.printParenthesizedExpression(node, identation);
        }
        else if (ts.isBooleanLiteral(node)) {
            return this.printBooleanLiteral(node);
        }
        else if (ts.SyntaxKind.ThisKeyword === node.kind) {
            return this.THIS_TOKEN;
        }
        else if (ts.SyntaxKind.SuperKeyword === node.kind) {
            return this.SUPER_TOKEN;
        }
        else if (ts.isTryStatement(node)) {
            return this.printTryStatement(node, identation);
        }
        else if (ts.isPrefixUnaryExpression(node)) {
            return this.printPrefixUnaryExpression(node, identation);
        }
        else if (ts.isNewExpression(node)) {
            return this.printNewExpression(node, identation);
        }
        else if (ts.isThrowStatement(node)) {
            return this.printThrowStatement(node, identation);
        }
        else if (ts.isAwaitExpression(node)) {
            return this.printAwaitExpression(node, identation);
        }
        else if (ts.isConditionalExpression(node)) {
            return this.printConditionalExpression(node, identation);
        }
        else if (ts.isAsExpression(node)) {
            return this.printAsExpression(node, identation);
        }
        else if (ts.isReturnStatement(node)) {
            return this.printReturnStatement(node, identation);
        }
        else if (ts.isArrayBindingPattern(node)) {
            return this.printArrayBindingPattern(node, identation);
        }
        if (node.statements) {
            const transformedStatements = node.statements.map((m) => {
                return this.printNode(m, identation + 1);
            });
            return transformedStatements.join("\n");
        }
        return "";
    }
}
export { BaseTranspiler };
