import { Transpiler } from '../src/transpiler';


jest.mock('module',()=>({
    __esModule: true,                    // this makes it work
    default: jest.fn()
  }));

let transpiler: Transpiler;

beforeAll(() => {
    transpiler = new Transpiler();
})

describe('php transpiling tests', () => {
    test('basic variable declaration', () => {
        const ts = "const x = 1;"
        const php = "$x = 1;"
        const output = transpiler.transpilePhp(ts);
        expect(output).toBe(php);
    });
    test('basic while loop', () => {
        const ts =
        "while (true) {\n" +
        "    const x = 1;\n" +
        "    break;\n" +
        "}"
        
        const php =
        "while (true) {\n" +
        "    $x = 1;\n" +
        "    break;\n" +
        "}"
        const output = transpiler.transpilePhp(ts);
        expect(output).toBe(php);
    });
    test('basic for loop', () => {
        const ts =
        "for (let i = 0; i < 10; i++) {\n" +
        "    break;\n" +
        "}"
        const php =
        "for ($i = 0; $i < 10; $i++) {\n" +
        "    break;\n" +
        "}"
        const output = transpiler.transpilePhp(ts);
        expect(output).toBe(php);
    });
  });