import { IFileImport } from "../src/types";
import { Transpiler } from "../src/transpiler";

let transpiler: Transpiler;

beforeAll(() => {
    transpiler = new Transpiler({});
})

describe('file imports tests', () => {
    test('basic default import [esm]', () => {
        const ts = "import o from 'otherfile.js'"
        const expected: IFileImport[] = [
            {
                "name": "o",
                "path": "otherfile.js",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
    test('basic named import [esm]', () => {
        const ts = "import {o} from 'otherfile.js'"
        const expected: IFileImport[] = [
            {
                "name": "o",
                "path": "otherfile.js",
                "isDefault": false,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
    test('multiple named imports [esm]', () => {
        const ts = "import {o,a} from 'otherfile.js'"
        const expected: IFileImport[] = [
            {
                "name": "o",
                "path": "otherfile.js",
                "isDefault": false,
            },
            {
                "name": "a",
                "path": "otherfile.js",
                "isDefault": false,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
    test('default and named imports and namespace import [esm]', () => {
        const ts = "import {o,a} from 'otherfile.js'\n" + 
        "import * as functions from 'functions.js'\n" +
        "import b from 'otherfile.js'"

        const expected: IFileImport[] = [
            {
                "name": "o",
                "path": "otherfile.js",
                "isDefault": false,
            },
            {
                "name": "a",
                "path": "otherfile.js",
                "isDefault": false,
            },
            {
                "name": "functions",
                "path": "functions.js",
                "isDefault": false,
            },
            {
                "name": "b",
                "path": "otherfile.js",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
    test('basic default import [cjs]', () => {
        const ts = "const o = require('otherfile.js')"
        const expected: IFileImport[] = [
            {
                "name": "o",
                "path": "otherfile.js",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
    test('basic named import [cjs]', () => {
        const ts = "const {o} = require('otherfile.js')"
        const expected: IFileImport[] = [
            {
                "name": "o",
                "path": "otherfile.js",
                "isDefault": false,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
    test('multiple named imports [cjs]', () => {
        const ts = "const {o,a} = require('otherfile.js')"
        const expected: IFileImport[] = [
            {
                "name": "o",
                "path": "otherfile.js",
                "isDefault": false,
            },
            {
                "name": "a",
                "path": "otherfile.js",
                "isDefault": false,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
    test('default and named imports [cjs]', () => {
        const ts = "const {o,a} = require('otherfile.js')\n" + 
        "const b = require('otherfile.js')"
        const expected: IFileImport[] = [
            {
                "name": "o",
                "path": "otherfile.js",
                "isDefault": false,
            },
            {
                "name": "a",
                "path": "otherfile.js",
                "isDefault": false,
            },
            {
                "name": "b",
                "path": "otherfile.js",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
});