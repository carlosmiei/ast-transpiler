import ts from 'typescript';
import { PythonTranspiler } from './pythonTranspiler.js';
import { PhpTranspiler } from './phpTranspiler.js';
import * as fs from 'fs';
import * as path from "path";
import { fileURLToPath } from 'url';

const { readFileSync, writeFileSync } = fs;

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const filename = "tmp.ts";

const PHP_OUTPUT = "./out/output.php"
const PHP_SYNC_OUTPUT = "./out/output-sync.php"
const PYTHON_OUTPUT = "./out/output.py"

function getProgramAndTypeCheckerFromMemory (rootDir: string, text: string, options: any = {}): [any,any,any]  {
    options = options || ts.getDefaultCompilerOptions();
    const inMemoryFilePath = path.resolve(path.join(rootDir, "__dummy-file.ts"));
    const textAst = ts.createSourceFile(inMemoryFilePath, text, options.target || ts.ScriptTarget.Latest);
    const host = ts.createCompilerHost(options, true);
    function overrideIfInMemoryFile(methodName: keyof ts.CompilerHost, inMemoryValue: any) {
        const originalMethod = host[methodName] as Function;
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
    constructor(config = {}) {
        this.config = config;
    }
    
    transpile(): string {

        if (this.config.content) {
            const [ memProgram, memType, memSource] = getProgramAndTypeCheckerFromMemory(__dirname, this.config.content);
            global.src = memSource;
            global.checker = memType;
            global.program = memProgram;

        } else {
            const path = this.config.path;
            const filename = path.split("/").pop();
            const program = ts.createProgram([filename], {});
            const sourceFile = program.getSourceFile(filename);
            const typeChecker = program.getTypeChecker();

            global.src = sourceFile;
            global.checker = typeChecker;
            global.program = program;
            
        }

        if (this.config.php) {
            const phpTransformer = new PhpTranspiler();
            return phpTransformer.printNode(global.src, -1);
        } else if (this.config.syncPhp) {
            const phpConfig = {
                "async": false
            }
            const phpTransformerSync = new PhpTranspiler(phpConfig);
            return phpTransformerSync.printNode(global.src, -1);
        } else if (this.config.python) {
            const pythonTransformer = new PythonTranspiler();
            return pythonTransformer.printNode(global.src, -1);
        }
    }

}   


const phpTransformerSync = new Transpiler({"syncPhp": true, "path": "./tmp.ts"});
const phpTransformer = new Transpiler({"php": true, "path": "./tmp.ts"});
const pythonTransformer = new Transpiler({"python": true, "path": "./tmp.ts"});

const pythonRes = pythonTransformer.transpile();
const phpRes = `<?php\n${phpTransformer.transpile()}\n?>`;
const phpSyncRes = `<?php\n${phpTransformerSync.transpile()}\n?>`;

writeFileSync(PHP_OUTPUT, phpRes);
writeFileSync(PYTHON_OUTPUT, pythonRes);
writeFileSync(PHP_SYNC_OUTPUT, phpSyncRes);

console.log("TRANSPILED!!")