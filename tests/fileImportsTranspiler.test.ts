import { IFileImport } from "../src/pureAst";
import { Transpiler } from "../src/transpiler";

let transpiler: Transpiler;

beforeAll(() => {
    transpiler = new Transpiler({});
})

describe('file imports tests', () => {
    test('basic default import', () => {
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
    test('basic named import', () => {
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
    test('multiple named imports', () => {
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
    test('default and named imports', () => {
        const ts = "import {o,a} from 'otherfile.js'\n" + 
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
                "name": "b",
                "path": "otherfile.js",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileImports(ts);
        expect(output).toMatchObject(expected);
    });
});