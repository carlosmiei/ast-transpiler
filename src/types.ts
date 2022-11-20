
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

const TranspilingError = (message) => ({
    error: new Error(message),
    code: 'TRANSPILING ERROR'
});

export {
    IFileImport,
    ITranspiledFile,
    IFileExport,
    TranspilingError
};