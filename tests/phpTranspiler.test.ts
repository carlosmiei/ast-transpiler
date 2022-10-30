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
    test('basic function declaration', () => {
        const php =
        "function teste(){\n" +
        "    return 1;\n" +
        "}" 
        const ts =
        "function teste () {\n" +
        "    return 1;\n" +
        "}\n"
        const output = transpiler.transpilePhp(ts);
        expect(output).toBe(php);
    });
    test('basic class declaration', () => {
        const ts =
        "class Test {\n" +
        "    describe() {\n" +
        "        return \"foo\";\n" +
        "    }\n" +
        "}\n" 
        const php =
        "class Test {\n" +
        "    function describe(){\n" +
        "        return 'foo';\n" +
        "    }\n" +
        "}"
        const output = transpiler.transpilePhp(ts);
        expect(output).toBe(php);
    });
    test('basic dictonary', () => {
        const ts =
        "const types = {\n" +
        "    'limit': 'limit',\n" +
        "    'market': 'market',\n" +
        "    'margin': 'market',\n" +
        "}\n" 
        const php =
        "$types = array(\n" +
        "    'limit' => 'limit',\n" +
        "    'market' => 'market',\n" +
        "    'margin' => 'market',\n" +
        ");"
        const output = transpiler.transpilePhp(ts);
        expect(output).toBe(php);
    });
    test('basic binary expressions', () => {
        const ts =
        "const a = 1 + 1;\n" +
        "const b = 2 * 2;\n" +
        "const c = 3 / 3;\n" +
        "const d = 4 - 4;\n" +
        "const e = 5 % 5;\n" +
        "const f = \"foo\" + \"bar\";\n";
        const php =
        "$a = 1 + 1;\n" +
        "$b = 2 * 2;\n" +
        "$c = 3 / 3;\n" +
        "$d = 4 - 4;\n" +
        "$e = 5 % 5;\n" +
        "$f = 'foo' . 'bar';"
        const output = transpiler.transpilePhp(ts);
        expect(output).toBe(php);
    })
  });