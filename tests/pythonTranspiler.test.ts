import { Transpiler } from '../src/transpiler';
 

let transpiler: Transpiler;

beforeAll(() => {
    transpiler = new Transpiler();
})


describe('python tests', () => {
    test('basic variable declaration', () => {
        const ts = "const x = 1;"
        const python = "x = 1"
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    });
    test('basic while loop', () => {
        const ts =
        "while (true) {\n" +
        "    const x = 1;\n" +
        "    break;\n" +
        "}"
        
        const python =
        "while True:\n" +
        "    x = 1\n" +
        "    break\n" 
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    });
    test('basic for loop', () => {
        const ts =
        "for (let i = 0; i < 10; i++) {\n" +
        "    break;\n" +
        "}"
        const python =
        "for i in range(0, 10):\n" +
        "    break\n";
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    });
    test('basic function declaration', () => {
        const ts =
        "function teste(){\n" +
        "    return 1;\n" +
        "}" 
        const python =
        "def teste():\n" +
        "    return 1\n";
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    });
    test('basic class declaration', () => {
        const ts =
        "class Teste {\n" +
        "    describe() {\n" +
        "        return \"foo\";\n" +
        "    }\n" +
        "}\n" 
        const python =
        "class Teste:\n" +
        "    def describe(self):\n" +
        "        return 'foo'\n"
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    });
    test('basic dictonary', () => {
        const ts =
        "const types = {\n" +
        "    'limit': 'limit',\n" +
        "    'market': 'market',\n" +
        "    'margin': 'market',\n" +
        "}\n" 
        const python =
        "types = {\n" +
        "    'limit': 'limit',\n" +
        "    'market': 'market',\n" +
        "    'margin': 'market',\n" +
        "}" 
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    });
    test('basic binary expressions', () => {
        const ts =
        "const a = 1 + 1;\n" +
        "const b = 2 * 2;\n" +
        "const c = 3 / 3;\n" +
        "const d = 4 - 4;\n" +
        "const e = 5 % 5;\n" +
        "const f = \"foo\" + \"bar\";\n";
        const python =
        "a = 1 + 1\n" +
        "b = 2 * 2\n" +
        "c = 3 / 3\n" +
        "d = 4 - 4\n" +
        "e = 5 % 5\n" +
        "f = 'foo' + 'bar'" 
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    });
    test('basic condition expressions', () => {
        const ts =
        "const a = true;\n" +
        "const b = false;\n" +
        "const c = true;\n" +
        "const d = (a && b) || (c && !b);\n" 
        const python =
        "a = True\n" +
        "b = False\n" +
        "c = True\n" +
        "d = (a and b) or (c and not b)";
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    });
    test('basic element access expression', () => {
        const ts =
        "const x = {};\n" +
        "x['foo'] = 'bar'"
        const python =
        "x = {}\n" +
        "x['foo'] = 'bar'"
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    })
    test('basic throw statement', () => {
        const ts =
        "function test () {\n" +
        "    throw new InvalidOrder (\"error\")\n" +
        "}";
        const python =
        "def test():\n" +
        "    raise InvalidOrder('error')\n";
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    })
});