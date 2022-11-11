# Transpiler
[![Build](https://github.com/carlosmiei/ast-transpiling/actions/workflows/node.js.yml/badge.svg?branch=master)](https://github.com/carlosmiei/ast-transpiling/actions/workflows/node.js.yml)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

Transpiler is a library that allows transpiling typescript code to different languages using typescript's abstract syntax tree (AST). 

As expected, it's not possible to transpile Typescript to Python or PHP in a 1:1 parity because they are different languages a lot of features are not interchangeable. Nonetheless, this library supports as many features as possible doing some adaptions (more to come).

Although we transpile TS code directly to the other languages, this library does touch import statements because each language has its own module/namespace model. Instead, we return a unified list of imports separately, allowing the user to adapt it to the target language easily and append it to the generated code (check `IFileImport`).

Both sync and async code transpilation is supported.

## Currently supported languages
- Python
- PHP

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install foobar.

```bash
npm install transpiler
```

## Usage

NAME_HERE is a hybrid package, supporting ESM and CJS out of the box. Choose the one that fits you better.

- Transpiling Typescript to Python from string
```Javascript 
import Transpiler from 'IMPORT-HERE'

const transpiler = new Transpiler({
    python: {
        uncamelcaseIdentifiers: true, 
    }
});

const ts = "const myVar = 1;"
const transpiledCode = transpiler.transpilePython(ts);

console.log(transpileCode.content) // prints my_var = 1
```

- Transpiling Typescript to PHP from file

```Javascript
const Transpiler = require('IMPORT-HERE');

const transpiler = new Transpiler();
const transpiledCode = transpiler.transpilePhpByPath("./my/path/file.ts");

console.log(transpiler.content) // prints transpiled php
console.log(transpiler.imports) // prints unified imports statements if any
```

## Supported Features

- Variable declarations
- Class/function/methods declarations
- For/While loops
- Basic string manipulation (concat, length, includes, etc)
- Basic arrays manipulation (includes, length, etc)
- Basic object manipulation (initialization, key access, etc)
- Binary expressions (+,-,*/,mod)
- Condition expressions (&&, ||)
- Basic math functions (Math.min, Math.max, Math.floor, parseFloat, parseInt,etc)
- Basic JSON methods (JSON.stringify, JSON.parse)
- Throw statements
- Conditional Expressions
- Break expressions
- Basic instanceof statements
- JSDoc comments
- snake casing of variables/calls/functions/methods
- Basic async support (async methods/functions, await, promise.all)
- Scope Resolution Operator conversion (PHP only)
- etc

We will try to add more features/conversations in the future but this process is also customizable, check the Overrides section.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)