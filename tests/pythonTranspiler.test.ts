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
    test('basic math functions', () => {
        const ts =
        "const a = Math.min (0, 5);\n" +
        "const b = Math.max (0, 5);\n" +
        "const c = parseFloat ('1.3');\n" +
        "const d = parseInt ('1.3');\n" +
        "const e = Number.MAX_SAFE_INTEGER;\n" +
        "const f = Math.abs (-2);\n" +
        "const g = Math.pow (1, 2);\n" +
        "const h = Math.round (5);\n" +
        "const i = Math.floor (5.5);"
        const python =
        "a = min(0,5)\n" +
        "b = max(0,5)\n" +
        "c = float('1.3')\n" +
        "d = int('1.3')\n" +
        "e = float('inf')\n" +
        "f = abs(-2)\n" +
        "g = math.pow(1,2)\n" +
        "h = int(round(5))\n" +
        "i = int(math.floor(5.5))";
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    })
    test('basic json methods', () => {
        const ts =
        "const j = JSON.stringify ({ 'a': 1, 'b': 2 });\n" +
        "const k = JSON.parse (j);\n";
        const python =
        "j = json.dumps({\n" +
        "    'a': 1,\n" +
        "    'b': 2,\n" +
        "})\n" +
        "k = json.loads(j)";
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    })
    test('basic string methods', () => {
        const ts =
        "const a = 'test';\n" +
        "const b = a.length;\n" +
        "const c = a.indexOf ('t');\n" +
        "const d = a.toUpperCase ();\n" +
        "const e = a.toLowerCase ();";
        const python =
        "a = 'test'\n" +
        "b = len(a)\n" +
        "c = a.find('t')\n" +
        "d = a.upper()\n" +
        "e = a.lower()";
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    })
    test('basic array manipulation', () => {
        const ts = "const myList = [1, 2, 3];\n" +
        "const listLength = myList.length;\n" +
        "const listFirst = myList[0];\n" +
        "myList.push (4);\n" +
        "myList.pop ();\n" +
        "myList.shift ();"
        const python = 
        "myList = [1, 2, 3]\n" +
        "listLength = len(myList)\n" +
        "listFirst = myList[0]\n" +
        "myList.append(4)\n" +
        "myList.pop()\n" +
        "myList.pop(0)"
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    })
    test('basic conditional expression', () => {
        const ts =
        "const test = frase ? frase.length : 0;"
        const python =
        "test = len(frase) if frase else 0";
        const output = transpiler.transpilePython(ts);
        expect(output).toBe(python);
    })
});