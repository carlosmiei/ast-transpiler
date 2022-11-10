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
        const output = transpiler.transpilePhp(ts).content;
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
        const output = transpiler.transpilePhp(ts).content;
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
        const output = transpiler.transpilePhp(ts).content;
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
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    });
    test('basic async function declaration', () => {
        const ts =
        "async function camelCase () {\n" +
        "    this.myFunc()\n" +
        "    await this.loadMarkets();\n" +
        "}"
        const php =
        "function camelCase(){\n" +
        "    $this->myFunc();\n" +
        "    Async\\await($this->loadMarkets());\n" +
        "}"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    });
    test('should convert async function declaration to sync', () => {
        transpiler.setPhpAsyncTranspiling(false);
        const ts =
        "async function camelCase () {\n" +
        "    this.myFunc()\n" +
        "    await this.loadMarkets();\n" +
        "}"
        const php =
        "function camelCase(){\n" +
        "    $this->myFunc();\n" +
        "    $this->loadMarkets();\n" +
        "}"
        const output = transpiler.transpilePhp(ts).content;
        transpiler.setPhpAsyncTranspiling(true);
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
        const output = transpiler.transpilePhp(ts).content;
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
        const output = transpiler.transpilePhp(ts).content;
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
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic conditions expressions', () => {
        const ts =
        "const a = true;\n" +
        "const b = false;\n" +
        "const c = true;\n" +
        "const d = (a && b) || (c && !b);\n" 
        const php =
        "$a = true;\n" +
        "$b = false;\n" +
        "$c = true;\n" +
        "$d = ($a && $b) || ($c && !$b);"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic element access expression', () => {
        const ts =
        "const x = {};\n" +
        "x['foo'] = 'bar'"
        const php =
        "$x = array();\n" +
        "$x['foo'] = 'bar';"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic throw statement', () => {
        const ts =
        "function test () {\n" +
        "    throw new InvalidOrder (\"error\")\n" +
        "}";
        const php =
        "function test(){\n" +
        "    throw new InvalidOrder('error');\n" +
        "}";
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
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
        "const i = Math.floor (5.5);\n";
        const php =
        "$a = min(0,5);\n" +
        "$b = max(0,5);\n" +
        "$c = floatval('1.3');\n" +
        "$d = intval('1.3');\n" +
        "$e = PHP_INT_MAX;\n" +
        "$f = abs(-2);\n" +
        "$g = pow(1,2);\n" +
        "$h = (int) round(5);\n" +
        "$i = (int) floor(5.5);"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic json methods', () => {
        const ts =
        "const j = JSON.stringify ({ 'a': 1, 'b': 2 });\n" +
        "const k = JSON.parse (j);\n";
        const php =
        "$j = json_encode(array(\n" +
        "    'a' => 1,\n" +
        "    'b' => 2,\n" +
        "));\n" +
        "$k = json_decode($j,$as_associative_array = true);";
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic scope resolution access', () => {
        const ts =
        "const d = super.describe ();"
        const php =
        "$d = parent::describe();"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('custom scope resolution access', () => {
        transpiler.setPHPPropResolution(['Precise'])
        const ts =
        "const d = Precise.describe ();"
        const php =
        "$d = Precise::describe();"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('string length', () => {
        const ts =
        "const myStr = \"test\";\n" +
        "const ff = myStr.length;"
        const php =
        "$myStr = 'test';\n" +
        "$ff = strlen($myStr);"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('array length', () => {
        const ts =
        "const myArray = [1, 2, 3];\n" +
        "const aa = myArray.length;"
        const php =
        "$myArray = [1, 2, 3];\n" +
        "$aa = count($myArray);"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic array manipulation', () => {
        const ts =
        "const myList = [1, 2, 3];\n" +
        "const listLength = myList.length;\n" +
        "const listFirst = myList[0];\n" +
        "myList.push (4);\n" +
        "myList.pop ();\n" +
        "myList.shift ();"
        const php =
        "$myList = [1, 2, 3];\n" +
        "$listLength = count($myList);\n" +
        "$listFirst = $myList[0];\n" +
        "$myList[] = 4;\n" +
        "array_pop($myList);\n" +
        "array_shift($myList);"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic conditional expression', () => {
        const ts =
        "const frase = \"ola\";\n" +
        "const test = frase ? frase.length : 0;"
        const php =
        "$frase = \'ola\';\n" +
        "$test = $frase ? strlen($frase) : 0;"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic instanceof statement', () => {
        const ts =
        "if (e instanceof NullResponse) {\n" +
        "    return [];\n" +
        "}"
        const php =
        "if (e instanceof NullResponse) {\n" +
        "    return [];\n" +
        "}"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic typeof expressions', () => {
        const ts =
        "const response = \"foo\";\n" +
        "typeof response !== 'string'\n" +
        "typeof response === 'object'\n" +
        "typeof response === 'boolean'\n" +
        "typeof response === 'number'";
        const php =
        "$response = 'foo';\n" +
        "!is_string($response);\n" +
        "is_array($response);\n" +
        "is_bool($response);\n" +
        "(is_int($response) || is_float($response));";
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic indexOf string [check existence]', () => {
        const ts =
        "const myString = \'bar\'\n" +
        "const exists = myString.indexOf (\"b\") >= 0;"
        const php =
        "$myString = 'bar';\n" +
        "$exists = mb_strpos($myString, 'b') !== false;"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic indexOf array [check existence]', () => {
        const ts =
        "const x = [1,2,3];\n" +
        "const y = x.indexOf(1) >= 0;"
        const php =
        "$x = [1, 2, 3];\n" +
        "$y = in_array(1, $x);"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic includes string', () => {
        const ts =
        "const myString = \'bar\'\n" +
        "const exists = myString.includes (\"b\");"
        const php =
        "$myString = 'bar';\n" +
        "$exists = str_contains($myString, 'b');"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic includes array', () => {
        const ts =
        "const x = [1,2,3];\n" +
        "const y = x.includes(1);"
        const php =
        "$x = [1, 2, 3];\n" +
        "$y = in_array(1, $x);"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('basic as expression', () => {
        const ts =
        "const x = 1;\n" +
        "const a = \"foo\";\n" +
        "const y = x as any;\n" +
        "const t = a as string;\n" +
        "const z = x as number;"
        const php =
        "$x = 1;\n" +
        "$a = 'foo';\n" +
        "$y = $x;\n" +
        "$t = $a;\n" +
        "$z = $x;" 
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
    })
    test('should snake_case function and method calls', () => {
        transpiler.setPhpUncamelCaseIdentifiers(true);
        const ts =
        "function camelCase () {\n" +
        "    this.myFunc()\n" +
        "    myFunc()\n" +
        "}";
        const php =
        "function camel_case(){\n" +
        "    $this->my_func();\n" +
        "    $my_func();\n" +
        "}"
        const output = transpiler.transpilePhp(ts).content;
        expect(output).toBe(php);
        transpiler.setPhpUncamelCaseIdentifiers(false);
    })
  });