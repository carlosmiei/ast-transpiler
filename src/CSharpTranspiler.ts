import { BaseTranspiler } from "./BaseTranspiler.js";
import ts, { TypeChecker } from 'typescript';
import { unCamelCase, regexAll } from "./utils.js";


const parserConfig = {

};

export class CSharpTranspiler extends BaseTranspiler {
    constructor(config = {}) {
        config['parser'] = Object.assign ({}, parserConfig, config['parser'] ?? {});
        
        super(config);

        // user overrides
        this.applyUserOverrides(config);
    }
}