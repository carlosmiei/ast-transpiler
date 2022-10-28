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

const inMemoryTs =  'const x = "ola" + "mundo";'

const [ memProgram, memType, memSource] = getProgramAndTypeCheckerFromMemory(__dirname, inMemoryTs);



const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker()

global.src = sourceFile;
global.checker = typeChecker;
global.program = program;

const pythonTransformer = new PythonTranspiler();

const phpConfig = {
    "async": false
}

const phpTransformerSync = new PhpTranspiler(phpConfig);
const phpTransformer = new PhpTranspiler();

const pythonRes = pythonTransformer.printNode(sourceFile, -1);
const phpRes = `<?php\n${phpTransformer.printNode(sourceFile, -1)}\n?>`;
const phpSyncRes = `<?php\n${phpTransformerSync.printNode(sourceFile, -1)}\n?>`;

writeFileSync(PHP_OUTPUT, phpRes);
writeFileSync(PYTHON_OUTPUT, pythonRes);
writeFileSync(PHP_SYNC_OUTPUT, phpSyncRes);

console.log("TRANSPILED!!")