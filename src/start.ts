import ts from 'typescript';
import { PythonTranspiler } from './pythonTranspiler.js';
import { PhpTranspiler } from './phpTranspiler.js';

import * as fs from 'fs';

const { readFileSync, writeFileSync } = fs;

const filename = "tmp.ts";

const PHP_OUTPUT = "./out/output.php"
const PYTHON_OUTPUT = "./out/output.py"

const program = ts.createProgram([filename], {});
const sourceFile = program.getSourceFile(filename);
const typeChecker = program.getTypeChecker()


const pythonTransformer = new PythonTranspiler();
const phpTransformer = new PhpTranspiler();
const pythonRes = pythonTransformer.printNode(sourceFile, -1);
const phpRes = `<?php\n ${phpTransformer.printNode(sourceFile, -1)}\n?>`;


writeFileSync(PHP_OUTPUT, phpRes);
writeFileSync(PYTHON_OUTPUT, pythonRes);

console.log("TRANSPILED!!")