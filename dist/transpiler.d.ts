import ts from 'typescript';

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

declare class BaseTranspiler {
    NUM_LINES_BETWEEN_CLASS_MEMBERS: number;
    NUM_LINES_END_FILE: number;
    SPACE_DEFAULT_PARAM: string;
    BLOCK_OPENING_TOKEN: string;
    BLOCK_CLOSING_TOKEN: string;
    SPACE_BEFORE_BLOCK_OPENING: string;
    CONDITION_OPENING: string;
    CONDITION_CLOSE: string;
    DEFAULT_IDENTATION: string;
    STRING_QUOTE_TOKEN: string;
    UNDEFINED_TOKEN: string;
    IF_TOKEN: string;
    ELSE_TOKEN: string;
    ELSEIF_TOKEN: string;
    THIS_TOKEN: string;
    SLASH_TOKEN: string;
    ASTERISK_TOKEN: string;
    PLUS_TOKEN: string;
    MINUS_TOKEN: string;
    EQUALS_TOKEN: string;
    EQUALS_EQUALS_TOKEN: string;
    EXCLAMATION_EQUALS_TOKEN: string;
    EXCLAMATION_EQUALS_EQUALS_TOKEN: string;
    EQUALS_EQUALS_EQUALS_TOKEN: string;
    AMPERSTAND_APERSAND_TOKEN: string;
    PLUS_EQUALS: string;
    BAR_BAR_TOKEN: string;
    PERCENT_TOKEN: string;
    RETURN_TOKEN: string;
    OBJECT_OPENING: string;
    OBJECT_CLOSING: string;
    LEFT_PARENTHESIS: string;
    RIGHT_PARENTHESIS: string;
    ARRAY_OPENING_TOKEN: string;
    ARRAY_CLOSING_TOKEN: string;
    TRUE_KEYWORD: string;
    FALSE_KEYWORD: string;
    NEW_CORRESPODENT: string;
    THROW_TOKEN: string;
    AWAIT_TOKEN: string;
    STATIC_TOKEN: string;
    EXTENDS_TOKEN: string;
    NOT_TOKEN: string;
    SUPER_TOKEN: string;
    PROPERTY_ACCESS_TOKEN: string;
    TRY_TOKEN: string;
    CATCH_TOKEN: string;
    CATCH_DECLARATION: string;
    BREAK_TOKEN: string;
    IN_TOKEN: string;
    LESS_THAN_TOKEN: string;
    GREATER_THAN_TOKEN: string;
    GREATER_THAN_EQUALS_TOKEN: string;
    LESS_THAN_EQUALS_TOKEN: string;
    PLUS_PLUS_TOKEN: string;
    MINUS_MINUS_TOKEN: string;
    CONSTRUCTOR_TOKEN: string;
    SUPER_CALL_TOKEN: string;
    WHILE_TOKEN: string;
    FOR_TOKEN: string;
    FOR_COND_OPEN: string;
    FOR_COND_CLOSE: string;
    FOR_OPEN: string;
    FOR_CLOSE: string;
    PROPERTY_ASSIGNMENT_TOKEN: string;
    LINE_TERMINATOR: string;
    FUNCTION_TOKEN: string;
    ASYNC_TOKEN: string;
    NEW_TOKEN: string;
    STRING_LITERAL_KEYWORD: string;
    STRING_KEYWORD: string;
    NUMBER_KEYWORD: string;
    PUBLIC_KEYWORD: string;
    PRIVATE_KEYWORD: string;
    SupportedKindNames: {};
    PostFixOperators: {};
    PrefixFixOperators: {};
    FunctionDefSupportedKindNames: {};
    LeftPropertyAccessReplacements: {};
    RightPropertyAccessReplacements: {};
    FullPropertyAccessReplacements: {};
    StringLiteralReplacements: {};
    CallExpressionReplacements: {};
    PropertyAccessRequiresParenthesisRemoval: any[];
    FuncModifiers: {};
    uncamelcaseIdentifiers: any;
    asyncTranspiling: any;
    constructor(config: any);
    initOperators(): void;
    applyUserOverrides(config: any): void;
    isStringType(flags: ts.TypeFlags): boolean;
    isAsyncFunction(node: any): boolean;
    getIden(num: any): string;
    getBlockOpen(): string;
    getBlockClose(identation: any, chainBlock?: boolean): string;
    startsWithUpperCase(str: any): boolean;
    unCamelCaseIfNeeded(name: string): string;
    transformIdentifier(identifier: any): string;
    printIdentifier(node: any): string;
    shouldRemoveParenthesisFromCallExpression(node: any): boolean;
    printInstanceOfExpression(node: any, identation: any): string;
    getCustomOperatorIfAny(left: any, right: any, operator: any): any;
    printCustomBinaryExpressionIfAny(node: any, identation: any): any;
    printBinaryExpression(node: any, identation: any): any;
    transformPropertyAcessExpressionIfNeeded(node: any): any;
    transformPropertyAcessRightIdentifierIfNeeded(name: string): string;
    getExceptionalAccessTokenIfAny(node: any): any;
    printPropertyAccessExpression(node: any, identation: any): string;
    printParameter(node: any, defaultValue?: boolean): string;
    printModifiers(node: any): any;
    transformLeadingComment(comment: any): any;
    transformTrailingComment(comment: any): any;
    printLeadingComments(node: any, identation: any): string;
    printTraillingComment(node: any, identation: any): string;
    printNodeCommentsIfAny(node: any, identation: any, parsedNode: any): string;
    printFunctionBody(node: any, identation: any): string;
    printFunctionDefinition(node: any, identation: any): string;
    transformFunctionNameIfNeeded(name: any): string;
    printFunctionDeclaration(node: any, identation: any): string;
    printMethodParameters(node: any): any;
    transformMethodNameIfNeeded(name: string): string;
    printMethodDefinition(node: any, identation: any): string;
    printMethodDeclaration(node: any, identation: any): string;
    printStringLiteral(node: any): any;
    printNumericLiteral(node: any): any;
    printArrayLiteralExpression(node: any): string;
    printVariableDeclarationList(node: any, identation: any): string;
    printVariableStatement(node: any, identation: any): string;
    printOutOfOrderCallExpressionIfAny(node: any, identation: any): any;
    printSuperCallInsideConstructor(node: any, identation: any): string;
    printCallExpression(node: any, identation: any): string;
    printClassBody(node: any, identation: any): any;
    printClassDefinition(node: any, identation: any): string;
    printClass(node: any, identation: any): string;
    printConstructorDeclaration(node: any, identation: any): string;
    printWhileStatement(node: any, identation: any): string;
    printForStatement(node: any, identation: any): string;
    printBreakStatement(node: any, identation: any): string;
    printPostFixUnaryExpression(node: any, identation: any): string;
    printPrefixUnaryExpression(node: any, identation: any): string;
    printObjectLiteralBody(node: any, identation: any): any;
    printObjectLiteralExpression(node: any, identation: any): string;
    printPropertyAssignment(node: any, identation: any): string;
    printElementAccessExpressionExceptionIfAny(node: any): any;
    printElementAccessExpression(node: any, identation: any): any;
    printIfStatement(node: any, identation: any): string;
    printParenthesizedExpression(node: any, identation: any): string;
    printBooleanLiteral(node: any): string;
    printTryStatement(node: any, identation: any): string;
    printNewExpression(node: any, identation: any): string;
    printThrowStatement(node: any, identation: any): string;
    printAwaitExpression(node: any, identation: any): string;
    printConditionalExpression(node: any, identation: any): string;
    printAsExpression(node: any, identation: any): string;
    printReturnStatement(node: any, identation: any): string;
    printArrayBindingPattern(node: any, identation: any): string;
    printBlock(node: any, identation: any, chainBlock?: boolean): string;
    printExpressionStatement(node: any, identation: any): string;
    printNode(node: any, identation?: number): string;
    getFileESMImports(node: any): IFileImport[];
    isCJSRequireStatement(node: any): boolean;
    isCJSModuleExportsExpressionStatement(node: any): boolean;
    getCJSImports(node: any): IFileImport[];
    getFileImports(node: any): IFileImport[];
    getESMExports(node: any): IFileExport[];
    getCJSExports(node: any): IFileExport[];
    getExportDeclarations(node: any): IFileExport[];
    getFileExports(node: any): IFileExport[];
}

declare class PythonTranspiler extends BaseTranspiler {
    constructor(config?: {});
    initConfig(): void;
    printOutOfOrderCallExpressionIfAny(node: any, identation: any): string;
    printElementAccessExpressionExceptionIfAny(node: any): string;
    printForStatement(node: any, identation: any): string;
    transformLeadingComment(comment: any): string;
    transformTrailingComment(comment: any): string;
    transformPropertyAcessExpressionIfNeeded(node: any): any;
    printClassDefinition(node: any, identation: any): string;
    printMethodParameters(node: any): any;
    printInstanceOfExpression(node: any, identation: any): string;
    handleTypeOfInsideBinaryExpression(node: any, identation: any): string;
    printCustomBinaryExpressionIfAny(node: any, identation: any): string;
    getCustomOperatorIfAny(left: any, right: any, operator: any): "is" | "is not";
}

declare class PhpTranspiler extends BaseTranspiler {
    awaitWrapper: any;
    propRequiresScopeResolutionOperator: string[];
    AWAIT_WRAPPER_OPEN: any;
    AWAIT_WRAPPER_CLOSE: any;
    ASYNC_FUNCTION_WRAPPER_OPEN: string;
    constructor(config?: {});
    printAwaitExpression(node: any, identation: any): string;
    transformIdentifier(identifier: any): string;
    getCustomOperatorIfAny(left: any, right: any, operator: any): "." | ".=";
    transformPropertyAcessExpressionIfNeeded(node: any): any;
    transformPropertyInsideCallExpressionIfNeeded(node: any): any;
    printOutOfOrderCallExpressionIfAny(node: any, identation: any): any;
    getExceptionalAccessTokenIfAny(node: any): string;
    printConditionalExpression(node: any, identation: any): string;
    handleTypeOfInsideBinaryExpression(node: any, identation: any): string;
    printCustomBinaryExpressionIfAny(node: any, identation: any): string;
    isComment(line: any): any;
    printFunctionBody(node: any, identation: any): string;
    transformLeadingComment(comment: any): string;
    initConfig(): void;
}

declare enum Languages {
    Python = 0,
    Php = 1
}
declare enum TranspilationMode {
    ByPath = 0,
    ByContent = 1
}
declare class Transpiler {
    config: any;
    pythonTranspiler: PythonTranspiler;
    phpTranspiler: PhpTranspiler;
    constructor(config?: {});
    setVerboseMode(verbose: boolean): void;
    createProgramInMemoryAndSetGlobals(content: any): void;
    createProgramByPathAndSetGlobals(path: any): void;
    checkFileDiagnostics(): void;
    transpile(lang: Languages, mode: TranspilationMode, file: string): ITranspiledFile;
    transpilePython(content: any): ITranspiledFile;
    transpilePythonByPath(path: any): ITranspiledFile;
    transpilePhp(content: any): ITranspiledFile;
    transpilePhpByPath(path: any): ITranspiledFile;
    getFileImports(content: string): IFileImport[];
    getFileExports(content: string): IFileExport[];
    setPHPPropResolution(props: string[]): void;
    setPhpUncamelCaseIdentifiers(uncamelCase: boolean): void;
    setPythonUncamelCaseIdentifiers(uncamelCase: boolean): void;
    setPhpAsyncTranspiling(async: boolean): void;
    setPythonAsyncTranspiling(async: boolean): void;
    setPythonStringLiteralReplacements(replacements: any): void;
}

export { Transpiler, Transpiler as default };
