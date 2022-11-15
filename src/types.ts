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

export {
    IFileImport,
    ITranspiledFile,
    IFileExport
};