import { BaseTranspiler } from "./BaseTranspiler.js";
import ts, { TypeChecker } from 'typescript';
import { unCamelCase, regexAll } from "./utils.js";


const parserConfig = {
    'ELSEIF_TOKEN': 'else if',
    'OBJECT_OPENING': 'new Dictionary<string, object>() {',
    'PROPERTY_ASSIGNMENT_TOKEN': ',',
    'VAR_TOKEN': 'var',
    'METHOD_TOKEN': ''
};

export class CSharpTranspiler extends BaseTranspiler {
    constructor(config = {}) {
        config['parser'] = Object.assign ({}, parserConfig, config['parser'] ?? {});
        
        super(config);

        // user overrides
        // this.applyUserOverrides(config);

        this.initConfig();
    }

    initConfig() {
        this.LeftPropertyAccessReplacements = {
            'this': '$this',
        };

        this.RightPropertyAccessReplacements = {

        };

        this.FullPropertyAccessReplacements = {
            'console.log': 'Console.WriteLine',
        };

        this.CallExpressionReplacements = {
        };
    }

    getBlockOpen(identation){
        return "\n" + this.getIden(identation)  + this.BLOCK_OPENING_TOKEN + "\n";
    }
}