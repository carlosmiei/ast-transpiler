const ts = require('typescript');

const code = `
const x = [1,2,3]
const y = x.length
`;

const filename = "tmp.ts";

const sourceFile = ts.createSourceFile(
    filename, code, ts.ScriptTarget.ES2016
);

const defaultCompilerHost = ts.createCompilerHost({});

const customCompilerHost = {
    getSourceFile: (name, languageVersion) => {
        console.log(`getSourceFile ${name}`);

        if (name === filename) {
            return sourceFile;
        } else {
            return defaultCompilerHost.getSourceFile(
                name, languageVersion
            );
        }
    },
    writeFile: (filename, data) => {},
    getDefaultLibFileName: () => "lib.d.ts",
    useCaseSensitiveFileNames: () => false,
    getCanonicalFileName: filename => filename,
    getCurrentDirectory: () => "",
    getNewLine: () => "\n",
    getDirectories: () => [],
    fileExists: () => true,
    readFile: () => ""
};


const program = ts.createProgram([filename], {}, customCompilerHost);

const typeChecker = program.getTypeChecker();

const node11 = sourceFile.statements[0]

const value = typeChecker.getTypeAtLocation(node11.declarationList.declarations[0])

console.log(value)