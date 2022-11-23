
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
    IFileImport,
    ITranspiledFile,
    IFileExport,
    TranspilationError,
    FunctionReturnTypeError,
    FunctionArgumentTypeError
};