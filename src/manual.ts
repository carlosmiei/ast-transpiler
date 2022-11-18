import { Transpiler } from '../src/transpiler.js';
import * as fs from 'fs';

const { readFileSync, writeFileSync } = fs;

const transpiler = new Transpiler({
    python: {
        uncamelcaseIdentifiers: true,   
    },
    php:  {
        uncamelcaseIdentifiers: true,
    }
});

transpiler.setPHPPropResolution(['super', 'Precise']);

transpiler.setPythonStringLiteralReplacements({
    'sha256': 'hashlib.sha256',
});

const file = "tmp.ts";

const pythonRes = transpiler.transpilePythonByPath(file);
const php = transpiler.transpilePhpByPath(file);
const phpRes = `<?php\n${php.content}\n?>`;


// const phpSyncRes = `<?php\n${transpiler.transpilePhpByPath(file)}\n?>`;

const PHP_OUTPUT = "./out/output.php";
const PHP_SYNC_OUTPUT = "./out/output-sync.php";
const PYTHON_OUTPUT = "./out/output.py";

writeFileSync(PHP_OUTPUT, phpRes);
writeFileSync(PYTHON_OUTPUT, pythonRes.content ?? "");
// writeFileSync(PHP_SYNC_OUTPUT, phpSyncRes);

console.log("TRANSPILED!!");


