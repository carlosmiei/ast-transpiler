import { IFileExport } from "../src/types";
import { Transpiler } from "../src/transpiler";

let transpiler: Transpiler;

beforeAll(() => {
    transpiler = new Transpiler({});
})

describe('file exports tests', () => {
    test('basic default export', () => {
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
    test('basic named export', () => {
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
    test('multiple named exports', () => {
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
});