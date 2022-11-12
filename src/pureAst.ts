import ts from 'typescript';
import { IFileImport } from './types.js';
import { unCamelCase } from "./utils.js";

const SyntaxKind = ts.SyntaxKind;

class BaseTranspiler {
    DEFAULT_IDENTATION = "    ";
    STRING_QUOTE_TOKEN = "'";
    UNDEFINED_TOKEN = "None";
    IF_TOKEN = "if";
    ELSE_TOKEN = "else";
    ELSEIF_TOKEN = "elif";
    THIS_TOKEN = "self";
    SLASH_TOKEN = "/";
    ASTERISK_TOKEN = "*";
    PLUS_TOKEN = "+";
    MINUS_TOKEN = "-";
    EQUALS_TOKEN = "=";
    EQUALS_EQUALS_TOKEN = "==";
    EXCLAMATION_EQUALS_TOKEN = "!=";
    AMPERSTAND_APERSAND_TOKEN = "and";
    PLUS_EQUALS = "+=";
    BAR_BAR_TOKEN = "or";
    PERCENT_TOKEN = "%";
    RETURN_TOKEN = "return";
    OBJECT_OPENING = "{";
    OBJECT_CLOSING = "}";
    LEFT_PARENTHESIS = "(";
    RIGHT_PARENTHESIS = ")";
    ARRAY_OPENING_TOKEN = "[";
    ARRAY_CLOSING_TOKEN = "]";
    TRUE_KEYWORD = "True";
    FALSE_KEYWORD = "False";
    NEW_CORRESPODENT = "new";
    THROW_TOKEN = "raise";
    AWAIT_TOKEN = "await";
    STATIC_TOKEN = "static";
    EXTENDS_TOKEN = "extends";
    NOT_TOKEN = "not ";
    SUPER_TOKEN = "super()";
    PROPERTY_ACCESS_TOKEN = ".";
    TRY_TOKEN = "try:";
    CATCH_TOKEN = "except";
    CATCH_OPEN = "";
    CATCH_CLOSE = ":";
    TRY_CONDITION_OPEN_TOKEN = "";
    BREAK_TOKEN = "break";
    IN_TOKEN = "in";
    LESS_THAN_TOKEN = "<";
    GREATER_THAN_TOKEN = ">";
    GREATER_THAN_EQUALS_TOKEN = ">=";
    LESS_THAN_EQUALS_TOKEN = "<=";
    PLUS_PLUS_TOKEN = "++";
    MINUS_MINUS_TOKEN = "--";

    CLASS_OPENING_TOKEN = ":";
    CLASS_CLOSING_TOKEN = "";
    CONSTRUCTOR_TOKEN = "def __init__";
    SUPER_CALL_TOKEN = "super().__init__";

    WHILE_TOKEN = "while";
    WHILE_OPEN = "";
    WHILE_COND_OPEN = "";
    WHILE_COND_CLOSE = ":";
    WHILE_CLOSE = "";

    FOR_TOKEN = "for";
    FOR_COND_OPEN = "(";
    FOR_COND_CLOSE = ")";
    FOR_OPEN = "{";
    FOR_CLOSE = "}";

    PROPERTY_ASSIGNMENT_TOKEN = ":";

    IF_COND_CLOSE = ":";
    IF_COND_OPEN = "";
    IF_CLOSE = "";
    IF_OPEN = "";
    ELSE_OPEN_TOKEN = ":";
    ELSE_CLOSE_TOKEN = "";

    LINE_TERMINATOR = "";

    FUNCTION_TOKEN="def";
    FUNCTION_DEF_OPEN = ":";
    FUNCTION_CLOSE = "";

    ASYNC_TOKEN = "async";

    NEW_TOKEN = "";

    STRING_LITERAL_KEYWORD = "StringLiteral";
    STRING_KEYWORD = "String";
    NUMBER_KEYWORD = "Number";

    PUBLIC_KEYWORD = "public";
    PRIVATE_KEYWORD = "private";

    SupportedKindNames = {};
    PostFixOperators = {};
    PrefixFixOperators = {};
    FunctionDefSupportedKindNames = {};
    
    LeftPropertyAccessReplacements = {};
    RightPropertyAccessReplacements = {};
    FullPropertyAccessReplacements = {};

    CallExpressionReplacements = {};
    PropertyAccessRequiresParenthesisRemoval = [];

    FuncModifiers = {};

    uncamelcaseIdentifiers;
    asyncTranspiling;

    constructor(config) {
        Object.assign (this, (config['parser'] || {}));
        this.uncamelcaseIdentifiers = false;
        this.initOperators();
    }

    initOperators() {
        this.SupportedKindNames = {
            [ts.SyntaxKind.StringLiteral]: this.STRING_LITERAL_KEYWORD,
            [ts.SyntaxKind.StringKeyword]: this.STRING_KEYWORD,
            [ts.SyntaxKind.NumberKeyword]: this.NUMBER_KEYWORD,
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

        this.FunctionDefSupportedKindNames = {
            [ts.SyntaxKind.StringKeyword]: this.STRING_KEYWORD
        };

        this.FuncModifiers = {
            [ts.SyntaxKind.AsyncKeyword]: this.ASYNC_TOKEN,
            [ts.SyntaxKind.PublicKeyword]: this.PUBLIC_KEYWORD,
            [ts.SyntaxKind.PrivateKeyword]: this.PRIVATE_KEYWORD,
        };
    }

    isStringType(flags: ts.TypeFlags) {
        return flags === ts.TypeFlags.String || flags === ts.TypeFlags.StringLiteral;
    }

    isAsyncFunction(node) {
        let modifiers = node.modifiers;
        if (modifiers === undefined) {
            return false;
        }
        modifiers = modifiers.filter(mod => mod.kind === ts.SyntaxKind.AsyncKeyword);

        return modifiers.length > 0;
    }

    getIden (num) {
        return this.DEFAULT_IDENTATION.repeat(num);
    }

    unCamelCaseIfNeeded(name: string): string {
        if (this.uncamelcaseIdentifiers) {
            return unCamelCase(name) ?? name;
        }
        return name;
    }

    transformIdentifier(identifier) {
        return this.unCamelCaseIfNeeded(identifier);
    }

    printIdentifier(node) {
        const idValue = node.text ?? node.escapedText;

        if (idValue === "undefined") {
            return this.UNDEFINED_TOKEN;
        }
        return this.transformIdentifier(idValue); // check this later
    }

    shouldRemoveParenthesisFromCallExpression(node) {
        if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            return this.PropertyAccessRequiresParenthesisRemoval.includes(node.expression.name.text);
        }
        return false;
    }

    printInstanceOfExpression(node, identation) {
        // const left = this.printNode(node.left, 0);
        // const right = this.printNode(node.right, 0);
        const left = node.left.escapedText;
        const right = node.right.escapedText;
        return this.getIden(identation) + `${left} instanceof ${right}`;
    }

    getCustomOperatorIfAny(left, right, operator) {
        return undefined;
    }

    printCustomBinaryExpressionIfAny(node, identation) {
        return undefined; // stub to override
    }

    printBinaryExpression(node, identation) {
        const {left, right, operatorToken} = node;

        const customBinaryExp = this.printCustomBinaryExpressionIfAny(node, identation);
        if (customBinaryExp) {
            return customBinaryExp;
        }

        if (operatorToken.kind == ts.SyntaxKind.InstanceOfKeyword) {
            return this.printInstanceOfExpression(node, identation);
        }

        const leftVar = this.printNode(left, 0);

        const rightVar = this.printNode(right, identation);

        let operator = this.SupportedKindNames[operatorToken.kind];

        const customOperator = this.getCustomOperatorIfAny(left, right, operatorToken);

        operator = customOperator ? customOperator : operator; 

        return this.getIden(identation) + leftVar +" "+ operator + " " + rightVar.trim();
    }

    transformPropertyAcessExpressionIfNeeded (node) {
        return undefined;
    }

    transformPropertyAcessRightIdentifierIfNeeded (name: string): string {
        return this.unCamelCaseIfNeeded(name);
    }
    
    getExceptionalAccessTokenIfAny(node) {
        return undefined; // stub to override
    }

    printPropertyAccessExpression(node, identation) {

        const expression = node.expression;

        const transformedProperty = this.transformPropertyAcessExpressionIfNeeded(node);
        if (transformedProperty) {
            return this.getIden(identation) + transformedProperty;
        }

        let leftSide = node.expression.escapedText;
        let rightSide = node.name.escapedText;

        let rawExpression = node.getFullText().trim();
        
        if (this.FullPropertyAccessReplacements.hasOwnProperty(rawExpression)){ // eslint-disable-line
            return this.getIden(identation) + this.FullPropertyAccessReplacements[rawExpression]; // eslint-disable-line
        }

        leftSide = this.LeftPropertyAccessReplacements.hasOwnProperty(leftSide) ? this.LeftPropertyAccessReplacements[leftSide] : this.printNode(expression, 0); // eslint-disable-line

        // checking "toString" insde the object will return the builtin toString method :X
        rightSide = this.RightPropertyAccessReplacements.hasOwnProperty(rightSide) ? // eslint-disable-line
                this.RightPropertyAccessReplacements[rightSide] : 
                this.transformPropertyAcessRightIdentifierIfNeeded(rightSide) ?? rightSide; 
        
        // join together the left and right side again
        const accessToken = this.getExceptionalAccessTokenIfAny(node) ?? this.PROPERTY_ACCESS_TOKEN;

        rawExpression = leftSide + accessToken + rightSide; 

        return this.getIden(identation) + rawExpression;
    }

    printParameter(node) {
        const name = this.printNode(node.name, 0);
        return name;
    }

    printModifiers(node) {
        let modifiers = node.modifiers;
        if (modifiers === undefined) {
            return "";
        }
        modifiers = modifiers.filter(mod => this.FuncModifiers[mod.kind]);

        if (!this.asyncTranspiling) {
            modifiers = modifiers.filter(mod => mod.kind !== ts.SyntaxKind.AsyncKeyword);
        }

        return modifiers.map(modifier => this.FuncModifiers[modifier.kind]).join(" ");
    }

    transformFunctionComment(comment) {
        return comment; // to override
    }

    printFunctionComment(node, identation) {
        const fullText = global.src.getFullText();
        const commentsRangeList = ts.getLeadingCommentRanges(fullText, node.pos);
        const commentsRange = commentsRangeList ? commentsRangeList : undefined;
        let res = "";
        if (commentsRange) {
            for (const commentRange of commentsRange) {
                const commentText = fullText.slice(commentRange.pos, commentRange.end);
                if (commentText !== undefined) {
                    res+= this.getIden(identation) + this.transformFunctionComment(commentText) + "\n";
                }
            }
        }
        return res;
    }

    printFunctionBody(node, identation) {
        const body = node.body;
        const statementsAsString = body.statements.map((s) => {
            return this.printNode(s, identation);

        }).filter((s)=>!!s).join("\n");
        return statementsAsString;
    }

    printFunctionDefinition(node, identation) {
        let name = node.name.escapedText;
        name = this.transformFunctionNameIfNeeded(name);

        const parsedArgs = node.parameters.map(param => this.printParameter(param)).join(", ");
        
        let modifiers = this.printModifiers(node);
        modifiers = modifiers ? modifiers + " " : modifiers;

        const functionDef = this.getIden(identation) + modifiers + this.FUNCTION_TOKEN + " " + name
            + "(" + parsedArgs + ")"
            + this.FUNCTION_DEF_OPEN
            + "\n";
            // // NOTE - must have RETURN TYPE in TS
            // + SupportedKindNames[returnType.kind]
            // +" {\n";

        return functionDef;
    }

    transformFunctionNameIfNeeded(name): string {
        return this.unCamelCaseIfNeeded(name);
    }
    
    printFunctionDeclaration(node, identation) {

        let functionDef = this.printFunctionDefinition(node, identation);

        const leadingComments = this.printFunctionComment(node.body.statements[0], identation+1);
       
        const funcBody = this.printFunctionBody(node, identation+1);

        const funcClose = this.FUNCTION_CLOSE ? this.getIden(identation) + this.FUNCTION_CLOSE : "";

        functionDef += leadingComments;
        functionDef += funcBody;
        functionDef += "\n";
        functionDef += funcClose;

        return functionDef;
    }
    
    printMethodParameters(node) {
        return node.parameters.map(param => this.printParameter(param)).join(", ");
    }
    
    transformMethodNameIfNeeded(name: string): string {
        return this.unCamelCaseIfNeeded(name);
    }

    printMethodDefinition(node, identation) {

        let name = node.name.escapedText;
        name = this.transformMethodNameIfNeeded(name);

        const parsedArgs = this.printMethodParameters(node);

        let modifiers = this.printModifiers(node);
        modifiers = modifiers ? modifiers + " " : "";

        const funcOpen = this.FUNCTION_DEF_OPEN;

        const methodDef = this.getIden(identation) + modifiers + this.FUNCTION_TOKEN + " " + name
            + "(" + parsedArgs + ")"
            + funcOpen
            + "\n";
            // // NOTE - must have RETURN TYPE in TS
            // + SupportedKindNames[returnType.kind]
            // +" {\n";

        return methodDef;

    }

    printMethodDeclaration(node, identation) {

        const methodClose = this.FUNCTION_CLOSE ? this.getIden(identation) + this.FUNCTION_CLOSE : "";

        const leadingComments = this.printFunctionComment(node.body.statements[0], identation+1);

        let methodDef = this.printMethodDefinition(node, identation);
        
        const funcBody = this.printFunctionBody(node, identation+1);
        
        methodDef += leadingComments;
        methodDef += funcBody;
        methodDef += "\n";
        methodDef += methodClose;

        return methodDef;
    }

    printStringLiteral(node) {
        const token = this.STRING_QUOTE_TOKEN;
        return token + node.text.replace(token, "\\" + token) + token;
    }

    printNumericLiteral(node) {
        return node.text;
    }

    printArrayLiteralExpression(node) {

        const elements = node.elements.map((e) => {
            return this.printNode(e);
        }).join(", ");
        return this.ARRAY_OPENING_TOKEN + elements + this.ARRAY_CLOSING_TOKEN;
    }

    printVariableDeclarationList(node,identation) {
        const declaration = node.declarations[0];
        // const name = declaration.name.escapedText;
        const parsedValue = this.printNode(declaration.initializer, identation);
        return this.getIden(identation) + this.printNode(declaration.name) + " = " + parsedValue.trim();
    }

    printVariableStatement(node, identation){
        const decList = node.declarationList;
        return this.printVariableDeclarationList(decList, identation) + this.LINE_TERMINATOR;

    }

    printOutOfOrderCallExpressionIfAny(node, identation) {
        return undefined; // stub to override
    }

    printSuperCallInsideConstructor(node, identation) {
        const args = node.arguments;

        const parsedArgs = args.map((a) => {
            return this.printNode(a, identation).trim();
        }).join(",");
        return this.getIden(identation) + this.SUPER_CALL_TOKEN + "(" + parsedArgs + ")";
    }

    printCallExpression(node, identation) {

        const expression = node.expression;

        const args = node.arguments;

        const parsedArgs = args.map((a) => {
            return this.printNode(a, identation).trim();
        }).join(",");
        
        const removeParenthesis = this.shouldRemoveParenthesisFromCallExpression(node);

        const finalExpression = this.printOutOfOrderCallExpressionIfAny(node, identation);

        if (finalExpression) {
            return this.getIden(identation) + finalExpression;
        }

        // print super() call inside constructor
        if (expression.kind === ts.SyntaxKind.SuperKeyword) {
            return this.printSuperCallInsideConstructor(node, identation);
        }

        let parsedExpression = undefined;
        if (this.CallExpressionReplacements.hasOwnProperty(expression.escapedText)) { // eslint-disable-line
            parsedExpression = this.CallExpressionReplacements[expression.escapedText];
        } else {
            parsedExpression = this.printNode(expression, 0);
        }

        let parsedCall = this.getIden(identation) + parsedExpression;
        if (!removeParenthesis) {
            parsedCall+= "(" + parsedArgs + ")";
        
        }    
        return parsedCall;
    }

    printClassBody(node, identation) {
        return node.members.map((m)=> {
            return this.printNode(m, identation+1);
        }).join("\n"); 

    }

    printClassDefinition(node, identation) {
        const className = node.name.escapedText;
        const heritageClauses = node.heritageClauses;

        let classInit = "";
        const classOpening = " " + this.CLASS_OPENING_TOKEN + "\n";
        if (heritageClauses !== undefined) {
            const classExtends = heritageClauses[0].types[0].expression.escapedText;
            classInit = this.getIden(identation) + "class " + className + " extends " + classExtends + classOpening;
        } else {
            classInit = this.getIden(identation) + "class " + className + classOpening;
        }
        return classInit;  
    }

    printClass(node, identation) {

        const classDefinition = this.printClassDefinition(node, identation);

        const classBody = this.printClassBody(node, identation);

        const classClosing = this.CLASS_CLOSING_TOKEN ? "\n" + this.CLASS_CLOSING_TOKEN : "";

        return classDefinition + classBody + classClosing;
    }

    printConstructorDeclaration (node, identation) {
        const args = this.printMethodParameters(node);
        const constructorBody = this.printFunctionBody(node, identation+1);
        const funcClose = this.FUNCTION_CLOSE ? this.getIden(identation) + this.FUNCTION_CLOSE : "";
        return this.getIden(identation) +
                this.CONSTRUCTOR_TOKEN + 
                "(" + args + ")" + 
                this.FUNCTION_DEF_OPEN +  "\n" + 
                constructorBody + "\n" +
                funcClose;
    }

    printWhileStatement(node, identation) {
        const loopExpression = node.expression;

        const expression = this.printNode(loopExpression, 0);

        const whileOpen = this.WHILE_OPEN ? " " + this.WHILE_OPEN : "";
        
        return this.getIden(identation) +
                    this.WHILE_TOKEN + " " +
                    this.WHILE_COND_OPEN +
                    expression + 
                    this.WHILE_COND_CLOSE + whileOpen + "\n" +
                    node.statement.statements.map(st => this.printNode(st, identation+1)).join("\n") + "\n" + 
                    this.WHILE_CLOSE;
    }

    printForStatement(node, identation) {
        const initializer = this.printNode(node.initializer, 0);
        const condition = this.printNode(node.condition, 0);
        const incrementor = this.printNode(node.incrementor, 0);

        return this.getIden(identation) +
                this.FOR_TOKEN + " " +
                this.FOR_COND_OPEN + 
                initializer + "; " + condition + "; " + incrementor +
                this.FOR_COND_CLOSE + " " + this.FOR_OPEN + "\n" +
                node.statement.statements.map(st => this.printNode(st, identation+1)).join("\n") + "\n" +  
                this.FOR_CLOSE;
    }

    printBreakStatement(node, identation) {
        return this.getIden(identation) + this.BREAK_TOKEN + this.LINE_TERMINATOR;
    }

    printPostFixUnaryExpression(node, identation) {
        const {operand, operator} = node;
        return this.getIden(identation) + this.printNode(operand, 0) + this.PostFixOperators[operator]; 
    }

    printPrefixUnaryExpression(node, identation) {
        const {operand, operator} = node;
        return this.getIden(identation) + this.PrefixFixOperators[operator] + this.printNode(operand, 0); 
    }

    printObjectLiteralBody(node, identation) {
        let body =  node.properties.map((p) => this.printNode(p, identation+1)).join(",\n");
        body = body ? body + "," : body;
        return body;
    }

    printObjectLiteralExpression(node, identation) {

        const objectBody = this.printObjectLiteralBody(node, identation);
        const formattedObjectBody = objectBody ? "\n" + objectBody + "\n" : objectBody;
        return  this.OBJECT_OPENING + formattedObjectBody +  this.getIden(identation) + this.OBJECT_CLOSING;
    }

    printPropertyAssignment(node, identation) {
        const {name, initializer} = node;
        const nameAsString = this.printNode(name, 0);
        const valueAsString = this.printNode(initializer, identation);

        return this.getIden(identation) + nameAsString +  this.PROPERTY_ASSIGNMENT_TOKEN + " " + valueAsString.trim();
    }

    printElementAccessExpressionExceptionIfAny(node) {
        return undefined; // stub to override
    }

    printElementAccessExpression(node, identation) {
        // example x['test']
        const {expression, argumentExpression} = node;

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
        const ifBody = node.thenStatement.statements.map((s) => this.printNode(s, identation+1)).join("\n");

        const isElseIf = node.parent.kind === ts.SyntaxKind.IfStatement;

        const prefix = isElseIf ? this.ELSEIF_TOKEN : this.IF_TOKEN;

        const ifOrElseIfIdentation = isElseIf && this.IF_CLOSE ? " " : this.getIden(identation);

        const ifEnd = this.IF_CLOSE ? this.getIden(identation) + this.IF_CLOSE : "";

        const ifOpen = this.IF_OPEN ? " " + this.IF_OPEN : "";
        let ifComplete  =  ifOrElseIfIdentation + prefix + " " + this.IF_COND_OPEN + expression + this.IF_COND_CLOSE + ifOpen +"\n" + ifBody + "\n" + ifEnd;

        const elseStatement = node.elseStatement;

        if (elseStatement?.kind === ts.SyntaxKind.Block) {
            
            const elseOpen = this.ELSE_OPEN_TOKEN;
            const elseClose = this.ELSE_CLOSE_TOKEN ? this.getIden(identation) + this.ELSE_CLOSE_TOKEN : " ";

            const elseIdentation = this.IF_CLOSE ? ' ' : this.getIden(identation);
            const elseBody = elseIdentation + this.ELSE_TOKEN + elseOpen + '\n' + elseStatement.statements.map((s) => this.printNode(s, identation+1)).join("\n") + "\n" + elseClose;
            
            ifComplete += elseBody;
            
        } else if (elseStatement?.kind === ts.SyntaxKind.IfStatement) {
            const elseBody = this.printIfStatement(elseStatement, identation);
            ifComplete += elseBody;
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
        const tryBody = node.tryBlock.statements.map((s) => this.printNode(s, identation+1)).join("\n");
        const catchBody = node.catchClause.block.statements.map((s) => this.printNode(s, identation+1)).join("\n");
        const catchDeclaration = " Exception as " + node.catchClause.variableDeclaration.name.escapedText;
        return this.getIden(identation) + this.TRY_TOKEN + "\n" + tryBody + "\n" + this.getIden(identation) + this.CATCH_TOKEN + this.CATCH_OPEN + catchDeclaration + this.CATCH_CLOSE + "\n" + catchBody;
    }

    printNewExpression(node, identation) {
        const expression = node.expression.escapedText;
        const args = node.arguments.map(n => this.printNode(n, 0)).join(",");
        const newToken = this.NEW_TOKEN ? this.NEW_TOKEN + " " : "";
        return newToken + expression + this.LEFT_PARENTHESIS + args + this.RIGHT_PARENTHESIS;
    }

    printThrowStatement(node, identation) {
        const expression = this.printNode(node.expression, 0);
        return this.getIden(identation) + this.THROW_TOKEN + " " + expression + this.LINE_TERMINATOR;
    }

    printAwaitExpression(node, identation) {
        const expression = this.printNode(node.expression, 0);
        const awaitToken = this.asyncTranspiling ? this.AWAIT_TOKEN + " " : "";
        return this.getIden(identation) + awaitToken + expression;
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
        const exp =  node.expression;
        let rightPart = exp ? (' ' + this.printNode(exp, identation)) : '';
        rightPart = rightPart.trim();
        rightPart = rightPart ? ' ' + rightPart + this.LINE_TERMINATOR : this.LINE_TERMINATOR;
        return this.getIden(identation) + this.RETURN_TOKEN + rightPart;
    }

    printArrayBindingPattern(node, identation) {
        const elements = node.elements.map((e) => this.printNode(e.name, identation)).join(", ");
        return this.getIden(identation) + this.ARRAY_OPENING_TOKEN + elements + this.ARRAY_CLOSING_TOKEN;
    }

    printNode(node, identation = 0): string {

        if(ts.isExpressionStatement(node)) {
            // return printExpressionStatement(node.expression, identation);
            return this.printNode(node.expression, identation) + this.LINE_TERMINATOR;
        } else if (ts.isFunctionDeclaration(node)){
            return this.printFunctionDeclaration(node, identation);
        } else if (ts.isClassDeclaration(node)) {
            return this.printClass(node, identation); 
        } else if (ts.isVariableStatement(node)) {
            return this.printVariableStatement(node, identation);
        } else if (ts.isMethodDeclaration(node)) {
            return this.printMethodDeclaration(node, identation); 
        } else if (ts.isStringLiteral(node)) {
            return this.printStringLiteral(node);
        } else if (ts.isNumericLiteral(node)) {
            return this.printNumericLiteral(node);
        } else if (ts.isPropertyAccessExpression(node)) {
            return this.printPropertyAccessExpression(node, identation); 
        } else if (ts.isArrayLiteralExpression(node)) {
            return this.printArrayLiteralExpression(node);
        } else if (ts.isCallExpression(node)) {
            return this.printCallExpression(node, identation);
        } else if (ts.isWhileStatement(node)) {
            return this.printWhileStatement(node, identation);
        } else if (ts.isBinaryExpression(node)) {
            return this.printBinaryExpression(node, identation);
        } else if (ts.isBreakStatement(node)) {
            return this.printBreakStatement(node, identation);
        } else if (ts.isForStatement(node)) {
            return this.printForStatement(node, identation);
        } else if (ts.isPostfixUnaryExpression(node)) {
            return this.printPostFixUnaryExpression(node, identation);
        } else if (ts.isVariableDeclarationList(node)) {
            return this.printVariableDeclarationList(node, identation); // statements are slightly different if inside a for
        } else if (ts.isObjectLiteralExpression(node)) {
            return this.printObjectLiteralExpression(node, identation);
        } else if (ts.isPropertyAssignment(node)) {
            return this.printPropertyAssignment(node, identation);
        } else if (ts.isIdentifier(node)) {
            return this.printIdentifier(node);
        } else if (ts.isElementAccessExpression(node)) {
            return this.printElementAccessExpression(node, identation);
        } else if (ts.isIfStatement(node)) {
            return this.printIfStatement(node, identation);
        } else if (ts.isParenthesizedExpression(node)) {
            return this.printParenthesizedExpression(node, identation);
        } else if ((ts as any).isBooleanLiteral(node)) {
            return this.printBooleanLiteral(node);
        } else if (ts.SyntaxKind.ThisKeyword === node.kind) {
            return this.THIS_TOKEN;
        } else if (ts.SyntaxKind.SuperKeyword === node.kind) {
            return this.SUPER_TOKEN;
        }else if (ts.isTryStatement(node)){
            return this.printTryStatement(node, identation);
        } else if (ts.isPrefixUnaryExpression(node)) {
            return this.printPrefixUnaryExpression(node, identation);
        } else if (ts.isNewExpression(node)) {
            return this.printNewExpression(node, identation);
        } else if (ts.isThrowStatement(node)) {
            return this.printThrowStatement(node, identation);
        } else if (ts.isAwaitExpression(node)) {
            return this.printAwaitExpression(node, identation);
        } else if (ts.isConditionalExpression(node)) {
            return this.printConditionalExpression(node, identation);
        } else if (ts.isAsExpression(node)) {
            return this.printAsExpression(node, identation);
        } else if (ts.isReturnStatement(node)) {
            return this.printReturnStatement(node, identation);
        } else if (ts.isArrayBindingPattern(node)) {
            return this.printArrayBindingPattern(node, identation);
        } else if (ts.isParameter(node)) {
            return this.printParameter(node);
        } else if (ts.isConstructorDeclaration(node)) {
            return this.printConstructorDeclaration(node, identation);
        }

        if (node.statements) {
            const transformedStatements = node.statements.map((m)=> {
                return this.printNode(m, identation + 1);
            });

            return transformedStatements.join("\n");
        }
        return "";
    }

    getFileImports(node): IFileImport[] {
        const result = [];
        const importStatements = node.statements.filter((s) => ts.isImportDeclaration(s));
        importStatements.forEach(node => {
            const importPath = node.moduleSpecifier.text;
            const importClause = node.importClause;
            const namedImports = importClause.namedBindings;
            if (namedImports) {
                namedImports.elements.forEach((elem) => {
                    const name = elem.name.text;
                    const fileImport: IFileImport = {
                        name,
                        path: importPath,
                        isDefault: false
                    };
                    result.push(fileImport);
                });
            } else {
                // default import
                const name = importClause.name.text;
                const fileImport: IFileImport = {
                    name,
                    path: importPath,
                    isDefault: true
                };
                result.push(fileImport);
            }
        });
        return result;
    }
}


export {
    BaseTranspiler
};