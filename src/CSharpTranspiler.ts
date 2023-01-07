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
    'SUPER_CALL_TOKEN': 'base',
    'FALSY_WRAPPER_OPEN': 'isTrue(',
    'FALSY_WRAPPER_CLOSE': ')',
    'COMPARISON_WRAPPER_OPEN' : "isEqual(",
    'COMPARISON_WRAPPER_CLOSE' : ")",
    'UKNOWN_PROP_WRAPPER_OPEN': 'this.call(',
    'UNKOWN_PROP_WRAPPER_CLOSE': ')',
    'UKNOWN_PROP_ASYNC_WRAPPER_OPEN': 'this.callAsync(',
    'UNKOWN_PROP_ASYNC_WRAPPER_CLOSE': ')',
    'EQUALS_WRAPPER_OPEN': 'isEqual(',
    'EQUALS_WRAPPER_CLOSE': ')',
    'DIFFERENT_WRAPPER_OPEN': '!isEqual(',
    'DIFFERENT_WRAPPER_CLOSE': ')',
    'GREATER_THAN_WRAPPER_OPEN': 'isGreaterThan(',
    'GREATER_THAN_WRAPPER_CLOSE': ')',
    'GREATER_THAN_EQUALS_WRAPPER_OPEN': 'isGreaterThanOrEqual(',
    'GREATER_THAN_EQUALS_WRAPPER_CLOSE': ')',
    'LESS_THAN_WRAPPER_OPEN': 'isLessThan(',
    'LESS_THAN_WRAPPER_CLOSE': ')',
    'LESS_THAN_EQUALS_WRAPPER_OPEN': 'isLessThanOrEqual(',
    'LESS_THAN_EQUALS_WRAPPER_CLOSE': ')',
    'PLUS_WRAPPER_OPEN':'add(',
    'PLUS_WRAPPER_CLOSE':')',
    'MINUS_WRAPPER_OPEN':'subtract(',
    'MINUS_WRAPPER_CLOSE':')',
    'ARRAY_LENGTH_WRAPPER_OPEN': 'getArrayLength(',
    'ARRAY_LENGTH_WRAPPER_CLOSE': ')',
    'DIVIDE_WRAPPER_OPEN': 'divide(',
    'DIVIDE_WRAPPER_CLOSE': ')',
    'MULTIPLY_WRAPPER_OPEN': 'multiply(',
    'MULTIPLY_WRAPPER_CLOSE': ')',
    'INDEXOF_WRAPPER_OPEN': 'getIndexOf(',
    'INDEXOF_WRAPPER_CLOSE': ')',
    'MOD_WRAPPER_OPEN': 'mod(',
    'MOD_WRAPPER_CLOSE': ')',
};

export class CSharpTranspiler extends BaseTranspiler {
    
    constructor(config = {}) {
        config['parser'] = Object.assign ({}, parserConfig, config['parser'] ?? {});
        
        super(config);

        this.requiresParameterType = true;
        this.requiresReturnType = true;
        this.asyncTranspiling = true;
        this.supportsFalsyOrTruthyValues = false;
        this.requiresCallExpressionCast = true;
        this.id = "C#";


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
            'JSON.parse': 'parseJson', // custom helper method
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
            // "parseInt": "parseINt",
            // "parseFloat": "float.Parse",
        };

        this.ReservedKeywordsReplacements = {
            'string': 'str',
            'object': 'obj',
            'params': 'parameters',
            'base': 'bs',
            'internal': 'intern',
            'event': 'eventVar'
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

    printThisElementAccesssIfNeeded(node, identation) {
        // convert this[method] into this.call(method) or this.callAsync(method)
        // const isAsync = node?.parent?.kind === ts.SyntaxKind.AwaitExpression;
        const isAsync = true; // setting to true for now, because there are some scenarios where we don't know
        // if the call is async or not, so we need to assume it is async
        // example Promise.all([this.unknownPropAsync()])
            const elementAccess = node.expression;
            if (elementAccess?.kind === ts.SyntaxKind.ElementAccessExpression) {
                if (elementAccess?.expression?.kind === ts.SyntaxKind.ThisKeyword) {
                    let parsedArg = node.arguments?.length > 0 ? this.printNode(node.arguments[0], identation).trimStart() : "";
                    const propName = this.printNode(elementAccess.argumentExpression, 0);
                    const wrapperOpen = isAsync ? this.UKNOWN_PROP_ASYNC_WRAPPER_OPEN : this.UKNOWN_PROP_WRAPPER_OPEN;
                    const wrapperClose = isAsync ? this.UNKOWN_PROP_ASYNC_WRAPPER_CLOSE : this.UNKOWN_PROP_WRAPPER_CLOSE;
                    parsedArg = parsedArg ? ", " + parsedArg : "";
                    return wrapperOpen + propName + parsedArg + wrapperClose;
                }
            }
        return; 
    }

    printElementAccessExpressionExceptionIfAny(node) {
        // convert this[method] into this.call(method) or this.callAsync(method)
    //    if (node?.expression?.kind === ts.SyntaxKind.ThisKeyword) {
    //         const isAsyncDecl = node?.parent?.kind === ts.SyntaxKind.AwaitExpression;
    //         const open = isAsyncDecl ? this.UKNOWN_PROP_ASYNC_WRAPPER_OPEN : this.UKNOWN_PROP_WRAPPER_OPEN;
    //         return open.replace('(', '');
    //    }
    }

    printWrappedUnknownThisProperty(node) {
        const type = global.checker.getResolvedSignature(node);
        if (type?.declaration === undefined) {
            let parsedArguments = node.arguments?.map((a) => this.printNode(a, 0)).join(", ");
            parsedArguments = parsedArguments ? ", " + parsedArguments : "";
            const propName = node.expression?.name.escapedText;
            const isAsyncDecl = true;
            // const isAsyncDecl = node?.parent?.kind === ts.SyntaxKind.AwaitExpression;
            const open = isAsyncDecl ? this.UKNOWN_PROP_ASYNC_WRAPPER_OPEN : this.UKNOWN_PROP_WRAPPER_OPEN;
            const close = this.UNKOWN_PROP_WRAPPER_CLOSE;
            return `${open}"${propName}"${parsedArguments}${close}`;
        }
        return undefined;
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
                        return `new List<string>(((Dictionary<string,object>)${parsedArg}).Keys)`;
                    case "Object.values":
                        return `new List<object>(((Dictionary<string,object>)${parsedArg}).Values)`;
                    case "Math.round":
                        return `Math.Round((double)${parsedArg})`;
                    case "Math.ceil":
                        return `Math.Ceiling((double)${parsedArg})`;
                    case "Math.floor":
                        return `Math.Floor((double)${parsedArg})`;
                    case "Math.abs":
                        return `Math.Abs((double)${parsedArg})`;
                }
            } else if (args.length === 2) 
            {
                const parsedArg1 = this.printNode(args[0], 0);
                const parsedArg2 = this.printNode(args[1], 0);
                switch (expressionText) {
                    case "Math.min":
                        return `mathMin(${parsedArg1}, ${parsedArg2})`;
                    case "Math.max":
                        return `mathMax(${parsedArg1}, ${parsedArg2})`;
                    case "Math.pow":
                        return `Math.Pow((double)${parsedArg1}, (double)${parsedArg2})`;
                }
            }
            const leftSide = node.expression?.expression;
            const leftSideText = leftSide ? this.printNode(leftSide, 0) : undefined;

            // wrap unknown property this.X calls
            if (leftSideText === this.THIS_TOKEN || leftSide.getFullText().indexOf("(this as any)") > -1) { // double check this
                const res = this.printWrappedUnknownThisProperty(node);
                if (res) {
                    return res;
                }
            }
    
            const rightSide = node.expression.name?.escapedText;
            
            const arg = args && args.length > 0 ? args[0] : undefined;
            
            if (arg) {
                const argText = this.printNode(arg, identation).trimStart();
                const type = global.checker.getTypeAtLocation(leftSide); // eslint-disable-line
                switch (rightSide) {
                    case 'includes':
                            return `${leftSideText}.Contains(${argText})`;
                    case 'join': // names.join(',') => String.Join(", ", names);
                        return `String.Join(${argText}, ${leftSideText})`;
                    case 'split': // "ol".split("o") "ol".Split(' ').ToList();
                        return `((string)${leftSideText}).Split(${argText}).ToList<string>()`;
                    case 'slice':
                        return `((string)${leftSideText}).Substring(${argText})`;
                    case 'replace':
                        return `((string)${leftSideText}).Replace(${argText}, ${this.printNode(args[1], identation)})`;
                    case 'indexOf':
                        return `${this.INDEXOF_WRAPPER_OPEN}${leftSideText}, ${argText}${this.INDEXOF_WRAPPER_CLOSE}`;
                }
            } else {
                switch(rightSide) {
                    case 'toUpperCase':
                        return `((string)${this.printNode(leftSide, 0)}).ToUpper()`;
                    case 'toLowerCase':
                        return `((string)${this.printNode(leftSide, 0)}).ToLower()`;
                }
            }
        }

        // replace this[method]() calls
        const thisElementAccess = this.printThisElementAccesssIfNeeded(node, identation);
        if (thisElementAccess) {
            return thisElementAccess;
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

        // handle: [x,d] = this.method()
        if (op === ts.SyntaxKind.EqualsToken && left.kind === ts.SyntaxKind.ArrayLiteralExpression) {
            const arrayBindingPatternElements = left.elements;
            const parsedArrayBindingElements = arrayBindingPatternElements.map((e) => this.printNode(e, 0));
            const syntheticName = parsedArrayBindingElements.join("") + "Variable";

            let arrayBindingStatement = this.getIden(identation) + `var ${syntheticName} = ${this.printNode(right, 0)};\n`;

            parsedArrayBindingElements.forEach((e, index) => {
                // const type = this.getType(node);
                // const parsedType = this.getTypeFromRawType(type);
                const leftElement = arrayBindingPatternElements[index];
                const leftType = global.checker.getTypeAtLocation(leftElement);
                const parsedType = this.getTypeFromRawType(leftType);
                
                const castExp = parsedType ? `(${parsedType})` : "";

                const statement = this.getIden(identation) + `${e} = ${castExp}${syntheticName}[${index}]`;
                if (index < parsedArrayBindingElements.length - 1) {
                    arrayBindingStatement += statement + ";\n";
                } else {
                    // printStatement adds the last ;
                    arrayBindingStatement += statement;
                }
            });

            return arrayBindingStatement;
        }

        if (op === ts.SyntaxKind.InKeyword) {
            return `${this.getIden(identation)}((Dictionary<string,object>)${this.printNode(right, 0)}).ContainsKey((string)${this.printNode(left, 0)})`;
        }
        const leftText = this.printNode(left, 0);
        const rightText = this.printNode(right, 0);

        if (op === ts.SyntaxKind.EqualsEqualsToken || op === ts.SyntaxKind.EqualsEqualsEqualsToken) {
            const open = this.EQUALS_WRAPPER_OPEN;
            const close = this.EQUALS_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.ExclamationEqualsEqualsToken || op === ts.SyntaxKind.ExclamationEqualsToken) {
            const open = this.DIFFERENT_WRAPPER_OPEN;
            const close = this.DIFFERENT_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.GreaterThanToken) {
            const open = this.GREATER_THAN_WRAPPER_OPEN;
            const close = this.GREATER_THAN_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.GreaterThanEqualsToken) {
            const open = this.GREATER_THAN_EQUALS_WRAPPER_OPEN;
            const close = this.GREATER_THAN_EQUALS_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.LessThanToken) {
            const open = this.LESS_THAN_WRAPPER_OPEN;
            const close = this.LESS_THAN_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.LessThanEqualsToken) {
            const open = this.LESS_THAN_EQUALS_WRAPPER_OPEN;
            const close = this.LESS_THAN_EQUALS_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.PlusToken) {
            const leftText = this.printNode(left, 0);
            const rightText = this.printNode(right, 0);
            const open = this.PLUS_WRAPPER_OPEN;
            const close = this.PLUS_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.MinusToken) {
            const open = this.MINUS_WRAPPER_OPEN;
            const close = this.MINUS_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.SlashToken) {
            const open = this.DIVIDE_WRAPPER_OPEN;
            const close = this.DIVIDE_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.AsteriskToken) {
            const open = this.MULTIPLY_WRAPPER_OPEN;
            const close = this.MULTIPLY_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        if (op === ts.SyntaxKind.PercentToken) {
            const open = this.MOD_WRAPPER_OPEN;
            const close = this.MOD_WRAPPER_CLOSE;
            return `${this.getIden(identation)}${open}${leftText}, ${rightText}${close}`;
        }

        // x = y
        // cast y to x type when y is unknown
        if (op === ts.SyntaxKind.EqualsToken) {
            const leftType = global.checker.getTypeAtLocation(left);
            const rightType = global.checker.getTypeAtLocation(right);

            if (this.isAnyType(rightType.flags) && !this.isAnyType(leftType.flags)) {
                const parsedType = this.getTypeFromRawType(leftType);
                return `${this.getIden(identation)}${leftText} = (${parsedType})(${rightText})`;
            }
        }

        return undefined;
    }

    // castVariableAssignmentIfNeeded(left, right, identation) {
    //     const leftType = global.checker.getTypeAtLocation(left);
    //     const rightType = global.checker.getTypeAtLocation(right);

    //     const leftText = this.printNode(left, 0);
    //     const rightText = this.printNode(right, 0);

    //     if (this.isAnyType(rightType.flags) && !this.isAnyType(leftType.flags)) {
    //         const parsedType = this.getTypeFromRawType(leftType);
    //         return `${this.getIden(identation)}${leftText} = (${parsedType})${rightText}`;
    //     }
    //     return undefined;
    // }

    printVariableDeclarationList(node,identation) {
        const declaration = node.declarations[0];
        // const name = declaration.name.escapedText;

        // handle array binding : input: const [a,b] = this.method()
        // output: var abVar = this.method; var a = abVar[0]; var b = abVar[1];
        if (declaration?.name.kind === ts.SyntaxKind.ArrayBindingPattern) {
            const arrayBindingPattern = declaration.name;
            const arrayBindingPatternElements = arrayBindingPattern.elements;
            const parsedArrayBindingElements = arrayBindingPatternElements.map((e) => this.printNode(e.name, 0));
            const syntheticName = parsedArrayBindingElements.join("") + "Variable";

            let arrayBindingStatement = this.getIden(identation) + `var ${syntheticName} = ${this.printNode(declaration.initializer, 0)};\n`;

            parsedArrayBindingElements.forEach((e, index) => {
                // const type = this.getType(node);
                // const parsedType = this.getTypeFromRawType(type);
                const statement = this.getIden(identation) + `var ${e} = ${syntheticName}[${index}]`;
                if (index < parsedArrayBindingElements.length - 1) {
                    arrayBindingStatement += statement + ";\n";
                } else {
                    // printStatement adds the last ;
                    arrayBindingStatement += statement;
                }
            });

            return arrayBindingStatement;
        }


        // handle default undefined initialization
        const parsedValue = this.printNode(declaration.initializer, identation).trimStart();
        const varToken = this.VAR_TOKEN ? this.VAR_TOKEN + " ": "";
        if (parsedValue === this.UNDEFINED_TOKEN) {
            return this.getIden(identation) + "object " + this.printNode(declaration.name) + " = " + parsedValue;
        }
        return this.getIden(identation) + varToken + this.printNode(declaration.name) + " = " + parsedValue;
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
                // rawExpression = this.isStringType(type.flags) ? `(string${leftSide}).Length` : `(${leftSide}.Cast<object>().ToList()).Count`;
                rawExpression = this.isStringType(type.flags) ? `((string)${leftSide}).Length` : `${this.ARRAY_LENGTH_WRAPPER_OPEN}${leftSide}${this.ARRAY_LENGTH_WRAPPER_CLOSE}`; // `(${leftSide}.Cast<object>()).ToList().Count`
                break;
            case 'push':
                rawExpression = `((List<object>)${leftSide}).Add`;
                break;
            // case 'push':
            //     rawExpression = `(List<object>${leftSide}).Add`s
            //     break;
        }
        return rawExpression;
    }

    printCustomDefaultValueIfNeeded(node) {
        if (ts.isArrayLiteralExpression(node) || ts.isObjectLiteralExpression(node)) {
            return this.UNDEFINED_TOKEN;
        }

        if (ts.isNumericLiteral(node)) {
            return this.UNDEFINED_TOKEN;
        }

        // convert x: number = undefined (invalid) into x = -1 (valid)
        if (node?.escapedText === "undefined" && global.checker.getTypeAtLocation(node?.parent)?.flags === ts.TypeFlags.Number) {
            // return "-1";
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
            const first = body.length > 0 ? body[0] : [];
            const remaining = body.length > 0 ? body.slice(1): [];
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
                    if (ts.isNumericLiteral(initializer)) {
                        initParams.push(`${this.printNode(param.name, 0)} ??= ${this.printNode(initializer, 0)};`);
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

    printInstanceOfExpression(node, identation) {
        const left = node.left.escapedText;
        const right = node.right.escapedText;
        return this.getIden(identation) + `${left} is ${right}`;
    }

    printAsExpression(node, identation) {
        const type = node.type;
        
        if (type.kind === ts.SyntaxKind.AnyKeyword) {
            return `((object)${this.printNode(node.expression, identation)})`;
        }

        if (type.kind === ts.SyntaxKind.StringKeyword) {
            return `((string)${this.printNode(node.expression, identation)})`;
        }

        if (type.kind === ts.SyntaxKind.ArrayType) {
            if (type.elementType.kind === ts.SyntaxKind.AnyKeyword) {
                return `(List<object>)(${this.printNode(node.expression, identation)})`;
            }
            if (type.elementType.kind === ts.SyntaxKind.StringKeyword) {
                return `(List<string>)(${this.printNode(node.expression, identation)})`;
            }
        }

        return this.printNode(node.expression, identation);
    }

    printArrayLiteralExpression(node) {

        let arrayOpen = this.ARRAY_OPENING_TOKEN;        
        const elems = node.elements;

        const elements = node.elements.map((e) => {
            return this.printNode(e);
        }).join(", ");

        // take into consideration list of promises
        if (elems.length > 0) {
            const first = elems[0];
            if (first.kind === ts.SyntaxKind.CallExpression) {
                // const type = global.checker.getTypeAtLocation(first);
                const type = this.getFunctionType(first);
                // const parsedType = this.getTypeFromRawType(type);
                // parsedType === "Task" || 
                if (type === undefined || elements.indexOf(this.UKNOWN_PROP_ASYNC_WRAPPER_OPEN) > -1) {
                    arrayOpen = "new List<Task<object>> {";
                } else {
                   arrayOpen = `new List<${type}> {`; 
                }
            }
        }

        return arrayOpen + elements + this.ARRAY_CLOSING_TOKEN;
    }
    
    // check this out later

}


// if (this.requiresCallExpressionCast) {
//     const parsedTypes = this.getTypesFromCallExpressionParameters(node);
//     const tmpArgs = [];
//     args.forEach((arg, index) => {
//         const parsedType = parsedTypes[index];
//         const cast = parsedType ? `(${parsedType})` : '';
//         tmpArgs.push(cast + this.printNode(arg, identation).trim());
//     });
//     parsedArgs = tmpArgs.join(",");
// } else {
//     parsedArgs = args.map((a) => {
//         return  this.printNode(a, identation).trim();
//     }).join(", ");
// }

// getTypesFromCallExpressionParameters(node) {
//     const resolvedParams = global.checker.getResolvedSignature(node).parameters;
//     const parsedTypes = [];
//     resolvedParams.forEach((p) => {
//         const decl = p.declarations[0];
//         const type = global.checker.getTypeAtLocation(decl);
//         const parsedType = this.getTypeFromRawType(type);
//         parsedTypes.push(parsedType);
//     });

//     return parsedTypes;
// }


// get class decl node
// Use the ts.getAllSuperTypeNodes function to get the base classes for the MyClass
// const baseClasses = ts.getAllSuperTypeNodes(classDeclaration);

// // Create a type checker
// const typeChecker = ts.createTypeChecker(sourceFile.context.program, sourceFile.context.checker);

// // Get the type of the base class
// const baseClassType = typeChecker.getTypeAtLocation(baseClasses[0]);

// // Get the class declaration for the base class
// const baseClassDeclaration = baseClassType.symbol.valueDeclaration;

// console.log(baseClassDeclaration);