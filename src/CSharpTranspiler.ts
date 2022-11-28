import { BaseTranspiler } from "./BaseTranspiler.js";
import ts, { TypeChecker } from 'typescript';

const parserConfig = {
    'ELSEIF_TOKEN': 'else if',
    'OBJECT_OPENING': 'new Dictionary<string, object>() {',
    'ARRAY_OPENING_TOKEN': 'new List<object>() {',
    'ARRAY_CLOSING_TOKEN': '}',
    'PROPERTY_ASSIGNMENT_TOKEN': ',',
    'VAR_TOKEN': 'var',
    'METHOD_TOKEN': '',
    'PROPERTY_ASSIGNMENT_OPEN': '{',
    'PROPERTY_ASSIGNMENT_CLOSE': '}',
    'SUPER_TOKEN': 'base',
    'SUPER_CALL_TOKEN': 'base'
};

export class CSharpTranspiler extends BaseTranspiler {
    
    constructor(config = {}) {
        config['parser'] = Object.assign ({}, parserConfig, config['parser'] ?? {});
        
        super(config);

        this.requiresParameterType = true;
        this.requiresReturnType = true;
        this.asyncTranspiling = true;

        this.initConfig();

        // user overrides
        this.applyUserOverrides(config);
    }

    initConfig() {
        this.LeftPropertyAccessReplacements = {
            // 'this': '$this',
        };

        this.RightPropertyAccessReplacements = {
            'push': 'Add', // list method
            'indexOf': 'IndexOf', // list method
            'toUpperCase': 'ToUpper',
            'toLowerCase': 'ToLower',
            'toString': 'ToString',
        };

        this.FullPropertyAccessReplacements = {
            'console.log': 'Console.WriteLine',
            'Number.MAX_SAFE_INTEGER': 'Int32.MaxValue',
            'Math.min': 'Math.Min',
            'Math.max': 'Math.Max',
            'Math.log': 'Math.Log',
            'Math.abs': 'Math.Abs',
            // 'Math.ceil':  'Math.Ceiling', // need cast
            // 'Math.round': 'Math.Round', // need to cast
            'Math.floor': 'Math.Floor',
            'Math.pow': 'Math.Pow',
            'Promise.all': 'Task.WhenAll',
        };

        this.CallExpressionReplacements = {
            "parseInt": "Int32.Parse",
            "parseFloat": "float.Parse",
        };

        this.ReservedKeywordsReplacements = {
            'params': 'parameters',
            'base': 'bs'
        };
    }

    getBlockOpen(identation){
        return "\n" + this.getIden(identation)  + this.BLOCK_OPENING_TOKEN + "\n";
    }

    printSuperCallInsideConstructor(node, identation) {
        return ""; // csharp does not need super call inside constructor
    }

    printConstructorDeclaration (node, identation) {
        const classNode = node.parent;
        const className = this.printNode(classNode.name, 0);
        const args = this.printMethodParameters(node);
        const constructorBody = this.printFunctionBody(node, identation);

        // find super call inside constructor and extract params
        let superCallParams = '';
        let hasSuperCall = false;
        node.body?.statements.forEach(statement => {
            if (ts.isExpressionStatement(statement)) {
                const expression = statement.expression;
                if (ts.isCallExpression(expression)) {
                    const expressionText = expression.expression.getText().trim();
                    if (expressionText === 'super') {
                        hasSuperCall = true;
                        superCallParams = expression.arguments.map((a) => {
                            return this.printNode(a, identation).trim();
                        }).join(", ");
                    }
                }
            }
        });

        if (hasSuperCall) {
            return this.getIden(identation) + className +
                `(${args}) : ${this.SUPER_CALL_TOKEN}(${superCallParams})` +
                constructorBody;
        }
        
        return this.getIden(identation) +
                className + 
                "(" + args + ")" + 
                constructorBody;
    }

    printOutOfOrderCallExpressionIfAny(node, identation) {
        if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
            const expressionText = node.expression.getText().trim();
            const args = node.arguments;
            if (args.length === 1) {
                const parsedArg = this.printNode(args[0], 0);
                switch (expressionText) {
                    // case "JSON.parse":
                    //     return `json_decode(${parsedArg}, $as_associative_array = true)`;
                    case "Array.isArray":
                        return `(${parsedArg}.GetType().IsGenericType && ${parsedArg}.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))`;
                    case "Object.keys":
                        return `new List<string>(${parsedArg}.Keys)`;
                    case "Object.values":
                        return `new List<object>(${parsedArg}.Values)`;
                    case "Math.round":
                        return `Math.Round((double)${parsedArg})`;
                    case "Math.ceil":
                        return `Math.Ceiling((double)${parsedArg})`;
                }
            }
            // const transformedProp = this.transformPropertyInsideCallExpressionIfNeeded(node.expression);

            // if (transformedProp) {
            //     return transformedProp;
            // }
    
            const leftSide = node.expression?.expression;
            const rightSide = node.expression.name?.escapedText;
    
            const arg = args && args.length > 0 ? args[0] : undefined;
            
            if (arg) {
                const argText = this.printNode(arg, identation).trimStart();
                const leftSideText = this.printNode(leftSide, 0);
                const type = global.checker.getTypeAtLocation(leftSide); // eslint-disable-line
                switch (rightSide) {
                    case 'includes':
                            return `${leftSideText}.Contains(${argText})`;
                    case 'join': // names.join(',') => String.Join(", ", names);
                        return `String.Join(${argText}, ${leftSideText})`;
                    case 'split': // "ol".split("o") "ol".Split(' ').ToList();
                        return `${leftSideText}.Split(${argText}).ToList<string>()`;
                }
            }
        }
        return undefined;
    }

    handleTypeOfInsideBinaryExpression(node, identation) {
        const left = node.left;
        const right = node.right.text;
        const op = node.operatorToken.kind;
        const expression = left.expression;

        const isDifferentOperator = op === ts.SyntaxKind.ExclamationEqualsEqualsToken || op === ts.SyntaxKind.ExclamationEqualsToken;
        const notOperator = isDifferentOperator ? this.NOT_TOKEN : "";

        const target = this.printNode(expression, 0);
        switch (right) {
            case "string":
                return this.getIden(identation) + notOperator + `(${target}).GetType() == typeof(string)`;
            case "number":
                return this.getIden(identation) + notOperator + `(${target}).GetType() == typeof(int) || (${target}).GetType() == typeof(float) || (${target}).GetType() == typeof(double)`;
            case "boolean":
                return this.getIden(identation) + notOperator + `(${target}).GetType() == typeof(bool)`;
            case "object":
                return this.getIden(identation) + notOperator + `(${target}).GetType() == typeof(Dictionary<string, object>)`;
        }

        return undefined;

    }

    printCustomBinaryExpressionIfAny(node, identation) {
        const left = node.left;
        const right = node.right;

        const op = node.operatorToken.kind;

        if (left.kind === ts.SyntaxKind.TypeOfExpression) {
            const typeOfExpression = this.handleTypeOfInsideBinaryExpression(node, identation);
            if (typeOfExpression) {
                return typeOfExpression;
            }
        }

        if (op === ts.SyntaxKind.InKeyword) {
            return `${this.getIden(identation)}${this.printNode(right, 0)}?.ContainsKey(${this.printNode(left, 0)})`;
        }

        return undefined;
    }

    transformPropertyAcessExpressionIfNeeded(node) {
        const expression = node.expression;
        const leftSide = this.printNode(expression, 0);
        const rightSide = node.name.escapedText;
        
        let rawExpression = undefined;

        switch(rightSide) {
            case 'length':
                const type = (global.checker as TypeChecker).getTypeAtLocation(expression); // eslint-disable-line
                this.warnIfAnyType(node, type.flags, leftSide, "length");
                rawExpression = this.isStringType(type.flags) ? `${leftSide}.Length` : `${leftSide}.Count`;
                break;
        }
        return rawExpression;
    }

    printCustomDefaultValueIfNeeded(node) {
        if (ts.isArrayLiteralExpression(node) || ts.isObjectLiteralExpression(node)) {
            return this.UNDEFINED_TOKEN;
        } 
        return undefined;
    }

    printFunctionBody(node, identation) {

        // check if there is any default parameter to initialize
        const funcParams = node.parameters;
        const initParams = [];
        if (funcParams.length > 0) {
            const body = node.body.statements;
            const first = body[0];
            const remaining = body.slice(1);
            let firstStatement = this.printNode(first, identation + 1);

            const remainingString = remaining.map((statement) => this.printNode(statement, identation + 1)).join("\n");
            funcParams.forEach((param) => {
                const initializer = param.initializer;
                if (initializer) {
                    if (ts.isArrayLiteralExpression(initializer)) {
                        initParams.push(`${this.printNode(param.name, 0)} ??= new List<object>();`);
                    }
                    if (ts.isObjectLiteralExpression(initializer)) {
                        initParams.push(`${this.printNode(param.name, 0)} ??= new Dictionary<string, object>();`);
                    }
                }
            });

            if (initParams.length > 0) {
                const defaultInitializers = initParams.map( l => this.getIden(identation+1) + l ).join("\n") + "\n";
                const bodyParts = firstStatement.split("\n");
                const commentPart = bodyParts.filter(line => this.isComment(line));
                const isComment = commentPart.length > 0;
                if (isComment) {
                    const commentPartString = commentPart.map((c) => this.getIden(identation+1) + c.trim()).join("\n");
                    const firstStmNoComment = bodyParts.filter(line => !this.isComment(line)).join("\n");
                    firstStatement = commentPartString + "\n" + defaultInitializers + firstStmNoComment;
                } else {
                    firstStatement = defaultInitializers + firstStatement;
                }
            } 
            const blockOpen = this.getBlockOpen(identation);
            const blockClose = this.getBlockClose(identation);
            firstStatement = remainingString.length > 0 ? firstStatement + "\n" : firstStatement;
            return blockOpen + firstStatement + remainingString + blockClose;
        }

        return super.printFunctionBody(node, identation);
    }
}