import ts from 'typescript';
import currentPath from "./dirname.cjs";
import { PythonTranspiler } from './pythonTranspiler.js';
import { PhpTranspiler } from './phpTranspiler.js';
import * as fs from 'fs';
import * as path from "path";
import { fileURLToPath } from 'url';

import { IFileImport, ITranspiledFile } from './types.js';

const __dirname_mock = currentPath;

function getProgramAndTypeCheckerFromMemory (rootDir: string, text: string, options: any = {}): [any,any,any]  {
    options = options || ts.getDefaultCompilerOptions();
    const inMemoryFilePath = path.resolve(path.join(rootDir, "__dummy-file.ts"));
    const textAst = ts.createSourceFile(inMemoryFilePath, text, options.target || ts.ScriptTarget.Latest);
    const host = ts.createCompilerHost(options, true);
    function overrideIfInMemoryFile(methodName: keyof ts.CompilerHost, inMemoryValue: any) {
        const originalMethod = host[methodName] as Function; // eslint-disable-line
        host[methodName] = (...args: unknown[]) => {
            // resolve the path because typescript will normalize it
            // to forward slashes on windows
            const filePath = path.resolve(args[0] as string);
            if (filePath === inMemoryFilePath)
                return inMemoryValue;
            return originalMethod.apply(host, args);
        };
    }

    overrideIfInMemoryFile("getSourceFile", textAst);
    overrideIfInMemoryFile("readFile", text);
    overrideIfInMemoryFile("fileExists", true);

    const program = ts.createProgram({
        options,
        rootNames: [inMemoryFilePath],
        host
    });

    const typeChecker = program.getTypeChecker();
    const sourceFile = program.getSourceFile(inMemoryFilePath);

    return [ program, typeChecker, sourceFile];
}


class Transpiler {
    config;
    pythonTranspiler: PythonTranspiler;
    phpTranspiler: PhpTranspiler;
    constructor(config = {}) {
        this.config = config;
        const phpConfig = config["php"] || {};
        const pythonConfig = config["python"] || {};
        this.pythonTranspiler = new PythonTranspiler(pythonConfig);
        this.phpTranspiler = new PhpTranspiler(phpConfig);
    }
    
    createProgramInMemoryAndSetGlobals(content) {
        const [ memProgram, memType, memSource] = getProgramAndTypeCheckerFromMemory(__dirname_mock, content);
        global.src = memSource;
        global.checker = memType as ts.TypeChecker;
        global.program = memProgram;
    }

    createProgramByPathAndSetGlobals(path) {
        const filename = path.split("/").pop();
        const program = ts.createProgram([filename], {});
        const sourceFile = program.getSourceFile(filename);
        const typeChecker = program.getTypeChecker();

        global.src = sourceFile;
        global.checker = typeChecker;
        global.program = program;
    }

    transpilePython(content): ITranspiledFile {
        this.createProgramInMemoryAndSetGlobals(content);
        const transpiledContent = this.pythonTranspiler.printNode(global.src, -1);
        const imports = this.pythonTranspiler.getFileImports(global.src);
        return {
            content: transpiledContent,
            imports
        };
    }

    transpilePythonByPath(path): ITranspiledFile {
        this.createProgramByPathAndSetGlobals(path);
        const transpiledContent = this.pythonTranspiler.printNode(global.src, -1);
        const imports = this.pythonTranspiler.getFileImports(global.src);
        return {
            content: transpiledContent,
            imports
        };
    }

    transpilePhp(content, async = true): ITranspiledFile {
        this.createProgramInMemoryAndSetGlobals(content);
        if (async) {
            this.phpTranspiler.asyncTranspiling = true;
        }
        const transpiledContent = this.phpTranspiler.printNode(global.src, -1);
        const imports = this.phpTranspiler.getFileImports(global.src);
        return {
            content: transpiledContent,
            imports
        };
    }

    transpilePhpByPath(path, async = true): ITranspiledFile {
        this.createProgramByPathAndSetGlobals(path);
        if (async) {
            this.phpTranspiler.asyncTranspiling = true;
        }
        const transpiledContent = this.phpTranspiler.printNode(global.src, -1);
        const imports = this.phpTranspiler.getFileImports(global.src);
        return {
            content: transpiledContent,
            imports
        };
    }

    getFileImports(content: string): IFileImport[] {
        this.createProgramInMemoryAndSetGlobals(content);
        return this.phpTranspiler.getFileImports(global.src);
    }

    setPHPPropResolution(props: string[]) {
        this.phpTranspiler.propRequiresScopeResolutionOperator = props;
    }

    setPhpUncamelCaseIdentifiers(uncamelCase: boolean) {
        this.phpTranspiler.uncamelcaseIdentifiers = uncamelCase;
    }
    
    setPythonUncamelCaseIdentifiers(uncamelCase: boolean) {
        this.pythonTranspiler.uncamelcaseIdentifiers = uncamelCase;
    }
}   

export {
    Transpiler
};