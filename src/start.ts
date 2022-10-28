import ts from 'typescript';
import { PythonTranspiler } from './pythonTranspiler.js';
import { PhpTranspiler } from './phpTranspiler.js';

import * as fs from 'fs';

const { readFileSync, writeFileSync } = fs;

const filename = "tmp.ts";

const PHP_OUTPUT = "./out/output.php"
const PHP_SYNC_OUTPUT = "./out/output-sync.php"
const PYTHON_OUTPUT = "./out/output.py"

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