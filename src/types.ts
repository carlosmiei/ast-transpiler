
interface IInput {
    language: Languages;
    async: boolean;
}

interface IFileImport {
    name: string;
    path: string;
    isDefault: boolean;
}

interface IFileExport {
    name: string;
    isDefault: boolean;
}

interface ITranspiledFile {
    content: string;
    imports: IFileImport[];
    exports: IFileExport[];
}

enum Languages {
    Python,
    Php,
    CSharp,
}

enum TranspilationMode {
    ByPath,
    ByContent
}

// const TranspilingError = (message) => ({
//     error: new Error(message),
//     code: 'TRANSPILING ERROR'
// });

class TranspilationError extends Error {
    constructor (message) {
        super (message);
        this.name = 'TranspilationError';
    }
}

class FunctionReturnTypeError extends TranspilationError {
    constructor (message) {
        super (message);
        this.name = 'FuctionReturnTypeError';
    }
}

class FunctionArgumentTypeError extends TranspilationError {
    constructor (message) {
        super (message);
        this.name = 'FunctionArgumentTypeError';
    }
}

export {
    Languages,
    TranspilationMode,
    IFileImport,
    ITranspiledFile,
    IFileExport,
    TranspilationError,
    FunctionReturnTypeError,
    FunctionArgumentTypeError,
    IInput
};