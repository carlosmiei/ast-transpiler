import { IFileExport } from "../src/types";
import { Transpiler } from "../src/transpiler";

let transpiler: Transpiler;

beforeAll(() => {
    transpiler = new Transpiler({});
})

describe('file exports tests [esm]', () => {
    test('basic default export [esm]', () => {
        const ts = "export default x;"
        const expected: IFileExport[] = [
            {
                "name": "x",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileExports(ts);
        expect(output).toMatchObject(expected);
    });
    test('basic named export [esm]', () => {
        const ts = "export {x}"
        const expected: IFileExport[] = [
            {
                "name": "x",
                "isDefault": false,
            }
        ];
        const output = transpiler.getFileExports(ts);
        expect(output).toMatchObject(expected);
    });
    test('multiple named exports [esm]', () => {
        const ts = "export {o,a};"
        const expected: IFileExport[] = [
            {
                "name": "o",
                "isDefault": false,
            },
            {
                "name": "a",
                "isDefault": false,
            }
        ];
        const output = transpiler.getFileExports(ts);
        expect(output).toMatchObject(expected);
    });
    test('default class export [esm]', () => {
        const ts = "export default class test() {};"
        const expected: IFileExport[] = [
            {
                "name": "test",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileExports(ts);
        expect(output).toMatchObject(expected);
    });
    test('default function export [esm]', () => {
        const ts = "export default function test() {};"
        const expected: IFileExport[] = [
            {
                "name": "test",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileExports(ts);
        expect(output).toMatchObject(expected);
    });
    test('default export [cjs', () => {
        const ts = "module.exports = test"
        const expected: IFileExport[] = [
            {
                "name": "test",
                "isDefault": true,
            }
        ];
        const output = transpiler.getFileExports(ts);
        expect(output).toMatchObject(expected);
    });
    test('multiple exports [cjs]', () => {
        const ts =
        "module.exports = {\n" +
        "    a,\n" +
        "    b,\n" +
        "    c,\n" +
        "}";
        const expected: IFileExport[] = [
            {
                "name": "a",
                "isDefault": false,
            },
            {
                "name": "b",
                "isDefault": false,
            },
            {
                "name": "c",
                "isDefault": false,
            }
        ];
        const output = transpiler.getFileExports(ts);
        expect(output).toMatchObject(expected);
    });
});