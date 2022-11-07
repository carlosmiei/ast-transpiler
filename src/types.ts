interface IFileImport {
    name: string;
    path: string;
    isDefault: boolean;
}

interface ITranspiledFile {
    content: string;
    imports: IFileImport[];
}

export {
    IFileImport,
    ITranspiledFile
};