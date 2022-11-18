import { Transpiler } from '../src/transpiler';
 

let transpiler: Transpiler;

beforeAll(() => {
    transpiler = new Transpiler();
})


describe('python tests', () => {
    test('basic variable declaration', () => {
        const ts = "const x = 1;"
        const python = "x = 1"
        const output = transpiler.transpilePython(ts).content;
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
        "    break" 
        const output = transpiler.transpilePython(ts).content;
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
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic function declaration', () => {
        const ts =
        "function teste(){\n" +
        "    return 1;\n" +
        "}" 
        const python =
        "def teste():\n" +
        "    return 1";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic function declaration with default parameters', () => {
        const ts =
        "function teste(x = \"foo\", y = undefined, params = {}) {\n" +
        "    return 1;\n" +
        "}"
        const python =
        "def teste(x = 'foo', y = None, params = {}):\n" +
        "    return 1"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic identation test [nested if]', () => {
        const ts =
        "if (1) {\n" +
        "    if (2) {\n" +
        "        if (4) {\n" +
        "            if (5) {\n" +
        "                const x = {};\n" +
        "            }\n" +
        "        }\n" +
        "    }\n" +
        "}"
        const python =
        "if 1:\n" +
        "    if 2:\n" +
        "        if 4:\n" +
        "            if 5:\n" +
        "                x = {}"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic identation test [if-else-if]', () => {
        const ts =
        "function teste() {\n" +
        "    if (1) {\n" +
        "        const x = 1;\n" +
        "    } else if (3) {\n" +
        "        const b = 2;\n" +
        "    } else {\n" +
        "        const a = 1;\n" +
        "    }\n" +
        "}";
        const python =
        "def teste():\n" +
        "    if 1:\n" +
        "        x = 1\n" +
        "    elif 3:\n" +
        "        b = 2\n" +
        "    else:\n" +
        "        a = 1";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic identation test [nested objects]', () => {
        const ts =
        "const x = {\n" +
        "    'world': {\n" +
        "        'hello': {\n" +
        "            'foo': 'bar'\n" +
        "        }\n" +
        "    }\n" +
        "}"
        const python =
        "x = {\n" +
        "    'world': {\n" +
        "        'hello': {\n" +
        "            'foo': 'bar',\n" +
        "        },\n" +
        "    },\n" +
        "}"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic if statement', () => {
        const ts =
        "if (1) {\n" +
        "    const x = 1;\n" +
        "}"
        const python =
        "if 1:\n" +
        "    x = 1";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic if else statement', () => {
        const ts =
        "if (1) {\n" +
        "    const x = 1;\n" +
        "} else {\n" +
        "    const x = 2;\n" +
        "}";
        const python =
        "if 1:\n" +
        "    x = 1\n" +
        "else:\n" +
        "    x = 2";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic if-elseif-else statement', () => {
        const ts =
        "if (1) {\n" +
        "    const x = 1;\n" +
        "} else if (2) {\n" +
        "    const x = 2;\n" +
        "} else {\n" +
        "    const x = 3;\n" +
        "}"
        const python =
        "if 1:\n" +
        "    x = 1\n" +
        "elif 2:\n" +
        "    x = 2\n" +
        "else:\n" +
        "    x = 3"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic async function declaration', () => {
        const ts =
        "async function camelCase () {\n" +
        "    this.myFunc()\n" +
        "    await this.loadMarkets();\n" +
        "}"
        const python =
        "async def camelCase():\n" +
        "    self.myFunc()\n" +
        "    await self.loadMarkets()"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('should convert async function declaration to sync', () => {
        transpiler.setPythonAsyncTranspiling(false);
        const ts =
        "async function camelCase () {\n" +
        "    this.myFunc()\n" +
        "    await this.loadMarkets();\n" +
        "}"
        const python =
        "def camelCase():\n" +
        "    self.myFunc()\n" +
        "    self.loadMarkets()"
        const output = transpiler.transpilePython(ts).content;
        transpiler.setPythonAsyncTranspiling(true);
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
        "        return 'foo'"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic class inheritance', () => {
        const ts =
        "class teste extends extended {\n" +
        "    method() {\n" +
        "        return 1;\n" +
        "    }\n" +
        "}";
        const python =
        "class teste(extended):\n" +
        "    def method(self):\n" +
        "        return 1";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic class declaration with constructor', () => {
        const ts =
        "class teste extends extended {\n" +
        "    constructor(x) {\n" +
        "        super(x);\n" +
        "    }\n" +
        "}" 
        const python =
        "class teste(extended):\n" +
        "    def __init__(self, x):\n" +
        "        super().__init__(x)";
        const output = transpiler.transpilePython(ts).content;
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
        const output = transpiler.transpilePython(ts).content;
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
        const output = transpiler.transpilePython(ts).content;
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
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic postfixUnary expression', () => {
        const ts =
        "let x = 1;\n" +
        "x++;\n" +
        "let y = 1;\n" +
        "y--;"
        const python =
        "x = 1\n" +
        "x += 1\n" +
        "y = 1\n" +
        "y -= 1"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('basic element access expression', () => {
        const ts =
        "const x = {};\n" +
        "x['foo'] = 'bar'"
        const python =
        "x = {}\n" +
        "x['foo'] = 'bar'"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic throw statement', () => {
        const ts =
        "function test () {\n" +
        "    throw new InvalidOrder (\"error\")\n" +
        "}";
        const python =
        "def test():\n" +
        "    raise InvalidOrder('error')";
        const output = transpiler.transpilePython(ts).content;
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
        const output = transpiler.transpilePython(ts).content;
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
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic string methods', () => {
        const ts =
        "const a = 'test';\n" +
        "const t = a.split (',');\n" +
        "const b = a.length;\n" +
        "const c = a.indexOf ('t');\n" +
        "const d = a.toUpperCase ();\n" +
        "const e = a.toLowerCase ();";
        const python =
        "a = 'test'\n" +
        "t = a.split(',')\n" +
        "b = len(a)\n" +
        "c = a.find('t')\n" +
        "d = a.upper()\n" +
        "e = a.lower()";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic array manipulation', () => {
        const ts = "const myList = [1, 2, 3];\n" +
        "const y = myList.join (',')\n" +
        "const i = myList.indexOf(1);\n" +
        "const listLength = myList.length;\n" +
        "const listFirst = myList[0];\n" +
        "myList.push (4);\n" +
        "myList.pop ();\n" +
        "myList.shift ();"
        const python = 
        "myList = [1, 2, 3]\n" +
        "y = ','.join(myList)\n" +
        "i = myList.find(1)\n" +
        "listLength = len(myList)\n" +
        "listFirst = myList[0]\n" +
        "myList.append(4)\n" +
        "myList.pop()\n" +
        "myList.pop(0)"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic conditional expression', () => {
        const ts =
        "const test = frase ? frase.length : 0;"
        const python =
        "test = len(frase) if frase else 0";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic instance of statement', () => {
        const ts =
        "if (e instanceof NullResponse) {\n" +
        "    return [];\n" +
        "}"
        const python =
        "if isinstance(e, NullResponse):\n" +
        "    return []"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic typeof expressions', () => {
        const ts =
        "const response = \"foo\";\n" +
        "typeof response !== 'string'\n" +
        "typeof response === 'object'\n" +
        "typeof response === 'boolean'\n" +
        "typeof response === 'number'";
        const python =
        "response = 'foo'\n" +
        "not isinstance(response, str)\n" +
        "isinstance(response, dict)\n" +
        "isinstance(response, bool)\n" +
        "isinstance(response, numbers.Real)";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('should convert ==/===/!== undefined to is None or is Not None ', () => {
        const ts =
        "const x = 1 === undefined;\n" +
        "const y = 1 !== undefined;\n" +
        "const c = 3 == undefined;";
        const python =
        "x = 1 is None\n" +
        "y = 1 is not None\n" +
        "c = 3 is None";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic indexOf string [check existence]', () => {
        const ts =
        "const myString = \"bar\"\n" +
        "const exists = myString.indexOf (\"b\") >= 0;"
        const python =
        "myString = \'bar\'\n" +
        "exists = 'b' in myString";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic indexOf list [check existence]', () => {
        const ts =
        "const myList = [1,2,3];\n" +
        "const exists = myList.indexOf (1) >= 0;"
        const python =
        "myList = [1, 2, 3]\n" +
        "exists = 1 in myList"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic includes list', () => {
        const ts =
        "const myList = [1,2,3];\n" +
        "const exists = myList.includes (1);"
        const python =
        "myList = [1, 2, 3]\n" +
        "exists = 1 in myList"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic includes string', () => {
        const ts =
        "const myString = \"bar\"\n" +
        "const exists = myString.includes (\"b\");"
        const python =
        "myString = \'bar\'\n" +
        "exists = 'b' in myString";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('basic as expression', () => {
        const ts =
        "const x = 1;\n" +
        "const a = \"foo\";\n" +
        "const y = x as any;\n" +
        "const t = a as string;\n" +
        "const z = x as number;"
        const python =
        "x = 1\n" +
        "a = 'foo'\n" +
        "y = x\n" +
        "t = a\n" +
        "z = x"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('should snake_case function and method calls', () => {
        transpiler.setPythonUncamelCaseIdentifiers(true);
        const ts =
        "function camelCase () {\n" +
        "    this.myFunc()\n" +
        "    myFunc()\n" +
        "}";
        const python =
        "def camel_case():\n" +
        "    self.my_func()\n" +
        "    my_func()";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
        transpiler.setPythonUncamelCaseIdentifiers(false);
    })
    test('should convert Promise.all to asyncio.gather', () => {
        const ts =
        "let promises = [ this.fetchSwapAndFutureMarkets (params), this.fetchUSDCMarkets (params) ];\n" +
        "promises = await Promise.all (promises);";
        const python =
        "promises = [self.fetchSwapAndFutureMarkets(params), self.fetchUSDCMarkets(params)]\n" +
        "promises = await asyncio.gather(*promises)";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('should convert JS doc', () => {
        const ts =
        "function fetchStatus (params ) {\n" +
        "    /**\n" +
        "     * @method\n" +
        "     * @name aax#fetchStatus\n" +
        "     * @description the latest known information on the availability of the exchange API\n" +
        "     * @param {object} params extra parameters specific to the aax api endpoint\n" +
        "     * @returns {object} a [status structure]{@link https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure}\n" +
        "     */\n" +
        "    return 1;\n" +
        "}";
        const python =
        "def fetchStatus(params):\n" +
        "    \"\"\"\n" +
        "    the latest known information on the availability of the exchange API\n" +
        "    :param dict params: extra parameters specific to the aax api endpoint\n" +
        "    :returns dict: a `status structure <https://docs.ccxt.com/en/latest/manual.html#exchange-status-structure>`\n" +
        "    \"\"\"\n" +
        "    return 1";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    })
    test('should convert regular comment', () => {
        const ts =
        "function test () {\n" +
        "    // comment 1\n" +
        "    // comment 2\n" +
        "    // comment 3\n" +
        "    const x = 1;\n" +
        "}";
        const python =
        "def test():\n" +
        "    # comment 1\n" +
        "    # comment 2\n" +
        "    # comment 3\n" +
        "    x = 1";
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
        transpiler.setPythonUncamelCaseIdentifiers(false);
    })
    test('should convert leading and trailing comments', () => {
        const ts =
        "// I'm a leading comment\n" +
        "const z = \"my var\" // I'm a trailing comment\n" +
        "const a = \"bar\" // I'm second trailing comment\n";
        const python =
        "# I'm a leading comment\n" +
        "z = 'my var'  # I'm a trailing comment\n" +
        "a = 'bar'  # I'm second trailing comment"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
        transpiler.setPythonUncamelCaseIdentifiers(false);
    })
    test('basic try-catch block', () => {
        const ts =
        "try {\n" +
        "    const x = 1;\n" +
        "} catch (e) {\n" +
        "    console.log(e);\n" +
        "}"
        const python =
        "try:\n" +
        "    x = 1\n" +
        "except Exception as e:\n" +
        "    print(e)" 
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
        transpiler.setPythonUncamelCaseIdentifiers(false);
    })
    test('should remove cjs import from transpiled code', () => {
        const ts =
        "const {a,b,x} = require  ('ola')  \n" +
        "const myVar = a.b;";
        const python = "myVar = a.b"
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
    test('should remove cjs exports from transpiled code', () => {
        const ts =
        "module.exports = {\n" +
        "    a,\n" +
        "    b,\n" +
        "    c,\n" +
        "}";
        const python = ""
        const output = transpiler.transpilePython(ts).content;
        expect(output).toBe(python);
    });
});