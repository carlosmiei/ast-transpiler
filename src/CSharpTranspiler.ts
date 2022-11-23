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
};

export class CSharpTranspiler extends BaseTranspiler {
    constructor(config = {}) {
        config['parser'] = Object.assign ({}, parserConfig, config['parser'] ?? {});
        
        super(config);

        this.requiresParameterType = true;
        this.requiresReturnType = true;

        this.initConfig();

        // user overrides
        this.applyUserOverrides(config);
    }

    initConfig() {
        this.LeftPropertyAccessReplacements = {
            'this': '$this',
        };

        this.RightPropertyAccessReplacements = {
            'push': 'append', // list method
            'indexOf': 'IndexOf', // list method
            'toUpperCase': 'ToUpper',
            'toLowerCase': 'ToLower',
        };

        this.FullPropertyAccessReplacements = {
            'console.log': 'Console.WriteLine',
            'Number.MAX_SAFE_INTEGER': 'Int32.MaxValue',
            'Math.min': 'Math.Min',
            'Math.max': 'Math.Max',
            'Math.log': 'Math.Log',
            'Math.abs': 'Math.Abs',
            'Math.ceil':  'Math.Ceil',
            'Math.round': 'Math.Round',
            'Math.floor': 'Math.Floor',
            'Math.pow': 'Math.Pow',
        };

        this.CallExpressionReplacements = {
            "parseInt": "Int32.Parse",
            "parseFloat": "float.Parse",
        };
    }

    getBlockOpen(identation){
        return "\n" + this.getIden(identation)  + this.BLOCK_OPENING_TOKEN + "\n";
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
                        return `new List<string>(${parsedArg}.Values)`;
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
}