var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/dirname.cjs
var require_dirname = __commonJS({
  "src/dirname.cjs"(exports, module) {
    module.exports = __dirname;
  }
});

// src/transpiler.ts
var import_dirname = __toESM(require_dirname(), 1);
import ts4 from "typescript";

// src/BaseTranspiler.ts
import ts from "typescript";

// src/types.ts
var TranspilingError = (message) => ({
  error: new Error(message),
  code: "TRANSPILING ERROR"
});

// src/utils.ts
function regexAll(text, array) {
  for (const i in array) {
    let regex = array[i][0];
    const flags = typeof regex === "string" ? "g" : void 0;
    regex = new RegExp(regex, flags);
    text = text.replace(regex, array[i][1]);
  }
  return text;
}
function unCamelCase(s) {
  return s.match(/[A-Z]/) ? s.replace(/[a-z0-9][A-Z]/g, (x) => x[0] + "_" + x[1]).replace(/[A-Z0-9][A-Z0-9][a-z][^$]/g, (x) => x[0] + "_" + x[1] + x[2] + x[3]).replace(/[a-z][0-9]$/g, (x) => x[0] + "_" + x[1]).toLowerCase() : void 0;
}

// src/logger.ts
import { green, yellow, red } from "colorette";
var Logger = class {
  static setVerboseMode(verbose) {
    this.verbose = verbose;
  }
  static log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }
  static success(message) {
    this.log(green(`[SUCCESS]: ${message}`));
  }
  static warning(message) {
    this.log(yellow(`[WARNING]: ${message}`));
  }
  static error(message) {
    this.log(red(`[ERROR]: ${message}`));
  }
};
Logger.verbose = true;

// src/BaseTranspiler.ts
var BaseTranspiler = class {
  constructor(config) {
    this.NUM_LINES_BETWEEN_CLASS_MEMBERS = 1;
    this.NUM_LINES_END_FILE = 1;
    this.SPACE_DEFAULT_PARAM = "";
    this.BLOCK_OPENING_TOKEN = ":";
    this.BLOCK_CLOSING_TOKEN = "";
    this.SPACE_BEFORE_BLOCK_OPENING = "";
    this.CONDITION_OPENING = "";
    this.CONDITION_CLOSE = "";
    this.DEFAULT_IDENTATION = "    ";
    this.STRING_QUOTE_TOKEN = "'";
    this.UNDEFINED_TOKEN = "None";
    this.IF_TOKEN = "if";
    this.ELSE_TOKEN = "else";
    this.ELSEIF_TOKEN = "elif";
    this.THIS_TOKEN = "self";
    this.SLASH_TOKEN = "/";
    this.ASTERISK_TOKEN = "*";
    this.PLUS_TOKEN = "+";
    this.MINUS_TOKEN = "-";
    this.EQUALS_TOKEN = "=";
    this.EQUALS_EQUALS_TOKEN = "==";
    this.EXCLAMATION_EQUALS_TOKEN = "!=";
    this.EXCLAMATION_EQUALS_EQUALS_TOKEN = "!=";
    this.EQUALS_EQUALS_EQUALS_TOKEN = "==";
    this.AMPERSTAND_APERSAND_TOKEN = "and";
    this.PLUS_EQUALS = "+=";
    this.BAR_BAR_TOKEN = "or";
    this.PERCENT_TOKEN = "%";
    this.RETURN_TOKEN = "return";
    this.OBJECT_OPENING = "{";
    this.OBJECT_CLOSING = "}";
    this.LEFT_PARENTHESIS = "(";
    this.RIGHT_PARENTHESIS = ")";
    this.ARRAY_OPENING_TOKEN = "[";
    this.ARRAY_CLOSING_TOKEN = "]";
    this.TRUE_KEYWORD = "True";
    this.FALSE_KEYWORD = "False";
    this.NEW_CORRESPODENT = "new";
    this.THROW_TOKEN = "raise";
    this.AWAIT_TOKEN = "await";
    this.STATIC_TOKEN = "static";
    this.EXTENDS_TOKEN = "extends";
    this.NOT_TOKEN = "not ";
    this.SUPER_TOKEN = "super()";
    this.PROPERTY_ACCESS_TOKEN = ".";
    this.TRY_TOKEN = "try";
    this.CATCH_TOKEN = "except";
    this.CATCH_DECLARATION = "Exception as";
    this.BREAK_TOKEN = "break";
    this.IN_TOKEN = "in";
    this.LESS_THAN_TOKEN = "<";
    this.GREATER_THAN_TOKEN = ">";
    this.GREATER_THAN_EQUALS_TOKEN = ">=";
    this.LESS_THAN_EQUALS_TOKEN = "<=";
    this.PLUS_PLUS_TOKEN = " += 1";
    this.MINUS_MINUS_TOKEN = " -= 1";
    this.CONSTRUCTOR_TOKEN = "def __init__";
    this.SUPER_CALL_TOKEN = "super().__init__";
    this.WHILE_TOKEN = "while";
    this.FOR_TOKEN = "for";
    this.FOR_COND_OPEN = "(";
    this.FOR_COND_CLOSE = ")";
    this.FOR_OPEN = "{";
    this.FOR_CLOSE = "}";
    this.PROPERTY_ASSIGNMENT_TOKEN = ":";
    this.LINE_TERMINATOR = "";
    this.FUNCTION_TOKEN = "def";
    this.ASYNC_TOKEN = "async";
    this.NEW_TOKEN = "";
    this.STRING_LITERAL_KEYWORD = "StringLiteral";
    this.STRING_KEYWORD = "String";
    this.NUMBER_KEYWORD = "Number";
    this.PUBLIC_KEYWORD = "public";
    this.PRIVATE_KEYWORD = "private";
    this.SupportedKindNames = {};
    this.PostFixOperators = {};
    this.PrefixFixOperators = {};
    this.FunctionDefSupportedKindNames = {};
    this.LeftPropertyAccessReplacements = {};
    this.RightPropertyAccessReplacements = {};
    this.FullPropertyAccessReplacements = {};
    this.StringLiteralReplacements = {};
    this.CallExpressionReplacements = {};
    this.PropertyAccessRequiresParenthesisRemoval = [];
    this.FuncModifiers = {};
    Object.assign(this, config["parser"] || {});
    this.uncamelcaseIdentifiers = false;
    this.initOperators();
  }
  initOperators() {
    this.SupportedKindNames = {
      [ts.SyntaxKind.StringLiteral]: this.STRING_LITERAL_KEYWORD,
      [ts.SyntaxKind.StringKeyword]: this.STRING_KEYWORD,
      [ts.SyntaxKind.NumberKeyword]: this.NUMBER_KEYWORD,
      [ts.SyntaxKind.MinusMinusToken]: this.MINUS_MINUS_TOKEN,
      [ts.SyntaxKind.MinusToken]: this.MINUS_TOKEN,
      [ts.SyntaxKind.SlashToken]: this.SLASH_TOKEN,
      [ts.SyntaxKind.AsteriskToken]: this.ASTERISK_TOKEN,
      [ts.SyntaxKind.InKeyword]: this.IN_TOKEN,
      [ts.SyntaxKind.PlusToken]: this.PLUS_TOKEN,
      [ts.SyntaxKind.PercentToken]: this.PERCENT_TOKEN,
      [ts.SyntaxKind.LessThanToken]: this.LESS_THAN_TOKEN,
      [ts.SyntaxKind.LessThanEqualsToken]: this.LESS_THAN_EQUALS_TOKEN,
      [ts.SyntaxKind.GreaterThanToken]: this.GREATER_THAN_TOKEN,
      [ts.SyntaxKind.GreaterThanEqualsToken]: this.GREATER_THAN_EQUALS_TOKEN,
      [ts.SyntaxKind.EqualsEqualsToken]: this.EQUALS_EQUALS_TOKEN,
      [ts.SyntaxKind.EqualsEqualsEqualsToken]: this.EQUALS_EQUALS_EQUALS_TOKEN,
      [ts.SyntaxKind.EqualsToken]: this.EQUALS_TOKEN,
      [ts.SyntaxKind.PlusEqualsToken]: this.PLUS_EQUALS,
      [ts.SyntaxKind.BarBarToken]: this.BAR_BAR_TOKEN,
      [ts.SyntaxKind.AmpersandAmpersandToken]: this.AMPERSTAND_APERSAND_TOKEN,
      [ts.SyntaxKind.ExclamationEqualsEqualsToken]: this.EXCLAMATION_EQUALS_EQUALS_TOKEN,
      [ts.SyntaxKind.ExclamationEqualsToken]: this.EXCLAMATION_EQUALS_TOKEN,
      [ts.SyntaxKind.AsyncKeyword]: this.ASYNC_TOKEN,
      [ts.SyntaxKind.AwaitKeyword]: this.AWAIT_TOKEN,
      [ts.SyntaxKind.StaticKeyword]: this.STATIC_TOKEN
    };
    this.PostFixOperators = {
      [ts.SyntaxKind.PlusPlusToken]: this.PLUS_PLUS_TOKEN,
      [ts.SyntaxKind.MinusMinusToken]: this.MINUS_MINUS_TOKEN
    };
    this.PrefixFixOperators = {
      [ts.SyntaxKind.ExclamationToken]: this.NOT_TOKEN,
      [ts.SyntaxKind.MinusToken]: this.MINUS_TOKEN
    };
    this.FunctionDefSupportedKindNames = {
      [ts.SyntaxKind.StringKeyword]: this.STRING_KEYWORD
    };
    this.FuncModifiers = {
      [ts.SyntaxKind.AsyncKeyword]: this.ASYNC_TOKEN,
      [ts.SyntaxKind.PublicKeyword]: this.PUBLIC_KEYWORD,
      [ts.SyntaxKind.PrivateKeyword]: this.PRIVATE_KEYWORD,
      [ts.SyntaxKind.StaticKeyword]: this.STATIC_TOKEN
    };
  }
  applyUserOverrides(config) {
    this.LeftPropertyAccessReplacements = Object.assign({}, this.LeftPropertyAccessReplacements, config["LeftPropertyAccessReplacements"] ?? {});
    this.RightPropertyAccessReplacements = Object.assign({}, this.RightPropertyAccessReplacements, config["RightPropertyAccessReplacements"] ?? {});
    this.FullPropertyAccessReplacements = Object.assign({}, this.FullPropertyAccessReplacements, config["FullPropertyAccessReplacements"] ?? {});
    this.CallExpressionReplacements = Object.assign({}, this.CallExpressionReplacements, config["CallExpressionReplacements"] ?? {});
    this.StringLiteralReplacements = Object.assign({}, this.StringLiteralReplacements, config["StringLiteralReplacements"] ?? {});
  }
  isStringType(flags) {
    return flags === ts.TypeFlags.String || flags === ts.TypeFlags.StringLiteral;
  }
  isAnyType(flags) {
    return flags === ts.TypeFlags.Any;
  }
  warnIfAnyType(flags, variable, target) {
    if (this.isAnyType(flags)) {
      Logger.warning(`${variable} has any type, ${target} might be incorrectly transpiled`);
    }
  }
  isAsyncFunction(node) {
    let modifiers = node.modifiers;
    if (modifiers === void 0) {
      return false;
    }
    modifiers = modifiers.filter((mod) => mod.kind === ts.SyntaxKind.AsyncKeyword);
    return modifiers.length > 0;
  }
  getIden(num) {
    return this.DEFAULT_IDENTATION.repeat(num);
  }
  getBlockOpen() {
    return this.SPACE_BEFORE_BLOCK_OPENING + this.BLOCK_OPENING_TOKEN + "\n";
  }
  getBlockClose(identation, chainBlock = false) {
    if (chainBlock) {
      return this.BLOCK_CLOSING_TOKEN ? "\n" + this.getIden(identation) + this.BLOCK_CLOSING_TOKEN + this.SPACE_BEFORE_BLOCK_OPENING : "\n" + this.getIden(identation) + this.BLOCK_CLOSING_TOKEN;
    }
    return this.BLOCK_CLOSING_TOKEN ? "\n" + this.getIden(identation) + this.BLOCK_CLOSING_TOKEN : "";
  }
  startsWithUpperCase(str) {
    return str.charAt(0) === str.charAt(0).toUpperCase();
  }
  unCamelCaseIfNeeded(name) {
    if (this.uncamelcaseIdentifiers && !this.startsWithUpperCase(name)) {
      return unCamelCase(name) ?? name;
    }
    return name;
  }
  transformIdentifier(identifier) {
    return this.unCamelCaseIfNeeded(identifier);
  }
  printIdentifier(node) {
    const idValue = node.text ?? node.escapedText;
    if (idValue === "undefined") {
      return this.UNDEFINED_TOKEN;
    }
    return this.transformIdentifier(idValue);
  }
  shouldRemoveParenthesisFromCallExpression(node) {
    if (node.expression.kind === ts.SyntaxKind.PropertyAccessExpression) {
      return this.PropertyAccessRequiresParenthesisRemoval.includes(node.expression.name.text);
    }
    return false;
  }
  printInstanceOfExpression(node, identation) {
    const left = node.left.escapedText;
    const right = node.right.escapedText;
    return this.getIden(identation) + `${left} instanceof ${right}`;
  }
  getCustomOperatorIfAny(left, right, operator) {
    return void 0;
  }
  printCustomBinaryExpressionIfAny(node, identation) {
    return void 0;
  }
  printBinaryExpression(node, identation) {
    const { left, right, operatorToken } = node;
    const customBinaryExp = this.printCustomBinaryExpressionIfAny(node, identation);
    if (customBinaryExp) {
      return customBinaryExp;
    }
    if (operatorToken.kind == ts.SyntaxKind.InstanceOfKeyword) {
      return this.printInstanceOfExpression(node, identation);
    }
    const leftVar = this.printNode(left, 0);
    const rightVar = this.printNode(right, identation);
    let operator = this.SupportedKindNames[operatorToken.kind];
    const customOperator = this.getCustomOperatorIfAny(left, right, operatorToken);
    operator = customOperator ? customOperator : operator;
    return this.getIden(identation) + leftVar + " " + operator + " " + rightVar.trim();
  }
  transformPropertyAcessExpressionIfNeeded(node) {
    return void 0;
  }
  transformPropertyAcessRightIdentifierIfNeeded(name) {
    return this.unCamelCaseIfNeeded(name);
  }
  getExceptionalAccessTokenIfAny(node) {
    return void 0;
  }
  printPropertyAccessExpression(node, identation) {
    const expression = node.expression;
    const transformedProperty = this.transformPropertyAcessExpressionIfNeeded(node);
    if (transformedProperty) {
      return this.getIden(identation) + transformedProperty;
    }
    let leftSide = node.expression.escapedText;
    let rightSide = node.name.escapedText;
    let rawExpression = node.getFullText().trim();
    if (this.FullPropertyAccessReplacements.hasOwnProperty(rawExpression)) {
      return this.getIden(identation) + this.FullPropertyAccessReplacements[rawExpression];
    }
    leftSide = this.LeftPropertyAccessReplacements.hasOwnProperty(leftSide) ? this.LeftPropertyAccessReplacements[leftSide] : this.printNode(expression, 0);
    rightSide = this.RightPropertyAccessReplacements.hasOwnProperty(rightSide) ? this.RightPropertyAccessReplacements[rightSide] : this.transformPropertyAcessRightIdentifierIfNeeded(rightSide) ?? rightSide;
    const accessToken = this.getExceptionalAccessTokenIfAny(node) ?? this.PROPERTY_ACCESS_TOKEN;
    rawExpression = leftSide + accessToken + rightSide;
    return this.getIden(identation) + rawExpression;
  }
  printParameter(node, defaultValue = true) {
    const name = this.printNode(node.name, 0);
    const initializer = node.initializer;
    if (defaultValue && initializer) {
      return name + this.SPACE_DEFAULT_PARAM + "=" + this.SPACE_DEFAULT_PARAM + this.printNode(initializer, 0);
    }
    return name;
  }
  printModifiers(node) {
    let modifiers = node.modifiers;
    if (modifiers === void 0) {
      return "";
    }
    modifiers = modifiers.filter((mod) => this.FuncModifiers[mod.kind]);
    if (!this.asyncTranspiling) {
      modifiers = modifiers.filter((mod) => mod.kind !== ts.SyntaxKind.AsyncKeyword);
    }
    return modifiers.map((modifier) => this.FuncModifiers[modifier.kind]).join(" ");
  }
  transformLeadingComment(comment) {
    return comment;
  }
  transformTrailingComment(comment) {
    return comment;
  }
  printLeadingComments(node, identation) {
    const fullText = global.src.getFullText();
    const commentsRangeList = ts.getLeadingCommentRanges(fullText, node.pos);
    const commentsRange = commentsRangeList ? commentsRangeList : void 0;
    let res = "";
    if (commentsRange) {
      for (const commentRange of commentsRange) {
        const commentText = fullText.slice(commentRange.pos, commentRange.end);
        if (commentText !== void 0) {
          const formatted = commentText.split("\n").map((line) => line.trim()).map((line) => !line.trim().startsWith("*") ? this.getIden(identation) + line : this.getIden(identation) + " " + line).join("\n");
          res += this.transformLeadingComment(formatted) + "\n";
        }
      }
    }
    return res;
  }
  printTraillingComment(node, identation) {
    const fullText = global.src.getFullText();
    const commentsRangeList = ts.getTrailingCommentRanges(fullText, node.end);
    const commentsRange = commentsRangeList ? commentsRangeList : void 0;
    let res = "";
    if (commentsRange) {
      for (const commentRange of commentsRange) {
        const commentText = fullText.slice(commentRange.pos, commentRange.end);
        if (commentText !== void 0) {
          res += " " + this.transformTrailingComment(commentText);
        }
      }
    }
    return res;
  }
  printNodeCommentsIfAny(node, identation, parsedNode) {
    const leadingComment = this.printLeadingComments(node, identation);
    const trailingComment = this.printTraillingComment(node, identation);
    return leadingComment + parsedNode + trailingComment;
  }
  printFunctionBody(node, identation) {
    return this.printBlock(node.body, identation);
  }
  printFunctionDefinition(node, identation) {
    let name = node.name.escapedText;
    name = this.transformFunctionNameIfNeeded(name);
    const parsedArgs = node.parameters.map((param) => this.printParameter(param)).join(", ");
    let modifiers = this.printModifiers(node);
    modifiers = modifiers ? modifiers + " " : modifiers;
    const functionDef = this.getIden(identation) + modifiers + this.FUNCTION_TOKEN + " " + name + "(" + parsedArgs + ")";
    return functionDef;
  }
  transformFunctionNameIfNeeded(name) {
    return this.unCamelCaseIfNeeded(name);
  }
  printFunctionDeclaration(node, identation) {
    let functionDef = this.printFunctionDefinition(node, identation);
    const funcBody = this.printFunctionBody(node, identation);
    functionDef += funcBody;
    return functionDef;
  }
  printMethodParameters(node) {
    return node.parameters.map((param) => this.printParameter(param)).join(", ");
  }
  transformMethodNameIfNeeded(name) {
    return this.unCamelCaseIfNeeded(name);
  }
  printMethodDefinition(node, identation) {
    let name = node.name.escapedText;
    name = this.transformMethodNameIfNeeded(name);
    const parsedArgs = this.printMethodParameters(node);
    let modifiers = this.printModifiers(node);
    modifiers = modifiers ? modifiers + " " : "";
    const methodDef = this.getIden(identation) + modifiers + this.FUNCTION_TOKEN + " " + name + "(" + parsedArgs + ")";
    return methodDef;
  }
  printMethodDeclaration(node, identation) {
    let methodDef = this.printMethodDefinition(node, identation);
    const funcBody = this.printFunctionBody(node, identation);
    methodDef += funcBody;
    return methodDef;
  }
  printStringLiteral(node) {
    const token = this.STRING_QUOTE_TOKEN;
    let text = node.text;
    if (text in this.StringLiteralReplacements) {
      return this.StringLiteralReplacements[text];
    }
    text = text.replaceAll("'", "\\'");
    text = text.replaceAll('"', '\\"');
    return token + text + token;
  }
  printNumericLiteral(node) {
    return node.text;
  }
  printArrayLiteralExpression(node) {
    const elements = node.elements.map((e) => {
      return this.printNode(e);
    }).join(", ");
    return this.ARRAY_OPENING_TOKEN + elements + this.ARRAY_CLOSING_TOKEN;
  }
  printVariableDeclarationList(node, identation) {
    const declaration = node.declarations[0];
    const parsedValue = this.printNode(declaration.initializer, identation);
    return this.getIden(identation) + this.printNode(declaration.name) + " = " + parsedValue.trim();
  }
  printVariableStatement(node, identation) {
    if (this.isCJSRequireStatement(node)) {
      return "";
    }
    const decList = node.declarationList;
    const varStatement = this.printVariableDeclarationList(decList, identation) + this.LINE_TERMINATOR;
    return this.printNodeCommentsIfAny(node, identation, varStatement);
  }
  printOutOfOrderCallExpressionIfAny(node, identation) {
    return void 0;
  }
  printSuperCallInsideConstructor(node, identation) {
    const args = node.arguments;
    const parsedArgs = args.map((a) => {
      return this.printNode(a, identation).trim();
    }).join(",");
    return this.getIden(identation) + this.SUPER_CALL_TOKEN + "(" + parsedArgs + ")";
  }
  printCallExpression(node, identation) {
    const expression = node.expression;
    const args = node.arguments;
    const parsedArgs = args.map((a) => {
      return this.printNode(a, identation).trim();
    }).join(", ");
    const removeParenthesis = this.shouldRemoveParenthesisFromCallExpression(node);
    const finalExpression = this.printOutOfOrderCallExpressionIfAny(node, identation);
    if (finalExpression) {
      return this.getIden(identation) + finalExpression;
    }
    if (expression.kind === ts.SyntaxKind.SuperKeyword) {
      return this.printSuperCallInsideConstructor(node, identation);
    }
    let parsedExpression = void 0;
    if (this.CallExpressionReplacements.hasOwnProperty(expression.escapedText)) {
      parsedExpression = this.CallExpressionReplacements[expression.escapedText];
    } else {
      if (expression.kind === ts.SyntaxKind.Identifier) {
        const idValue = expression.text ?? expression.escapedText;
        parsedExpression = this.unCamelCaseIfNeeded(idValue);
      } else {
        parsedExpression = this.printNode(expression, 0);
      }
    }
    let parsedCall = this.getIden(identation) + parsedExpression;
    if (!removeParenthesis) {
      parsedCall += "(" + parsedArgs + ")";
    }
    return parsedCall;
  }
  printClassBody(node, identation) {
    const parsedMembers = [];
    node.members.forEach((m, index) => {
      const parsedNode = this.printNode(m, identation + 1);
      if (m.kind === ts.SyntaxKind.PropertyDeclaration || index === 0) {
        parsedMembers.push(parsedNode);
      } else {
        parsedMembers.push("\n".repeat(this.NUM_LINES_BETWEEN_CLASS_MEMBERS) + parsedNode);
      }
    });
    return parsedMembers.join("\n");
  }
  printClassDefinition(node, identation) {
    const className = node.name.escapedText;
    const heritageClauses = node.heritageClauses;
    let classInit = "";
    const classOpening = this.getBlockOpen();
    if (heritageClauses !== void 0) {
      const classExtends = heritageClauses[0].types[0].expression.escapedText;
      classInit = this.getIden(identation) + "class " + className + " extends " + classExtends + classOpening;
    } else {
      classInit = this.getIden(identation) + "class " + className + classOpening;
    }
    return classInit;
  }
  printClass(node, identation) {
    const classDefinition = this.printClassDefinition(node, identation);
    const classBody = this.printClassBody(node, identation);
    const classClosing = this.getBlockClose(identation);
    return classDefinition + classBody + classClosing;
  }
  printConstructorDeclaration(node, identation) {
    const args = this.printMethodParameters(node);
    const constructorBody = this.printFunctionBody(node, identation);
    return this.getIden(identation) + this.CONSTRUCTOR_TOKEN + "(" + args + ")" + constructorBody;
  }
  printWhileStatement(node, identation) {
    const loopExpression = node.expression;
    const expression = this.printNode(loopExpression, 0);
    const whileStm = this.getIden(identation) + this.WHILE_TOKEN + " " + this.CONDITION_OPENING + expression + this.CONDITION_CLOSE + this.printBlock(node.statement, identation);
    return this.printNodeCommentsIfAny(node, identation, whileStm);
  }
  printForStatement(node, identation) {
    const initializer = this.printNode(node.initializer, 0);
    const condition = this.printNode(node.condition, 0);
    const incrementor = this.printNode(node.incrementor, 0);
    const forStm = this.getIden(identation) + this.FOR_TOKEN + " " + this.FOR_COND_OPEN + initializer + "; " + condition + "; " + incrementor + this.FOR_COND_CLOSE + this.printBlock(node.statement, identation);
    return this.printNodeCommentsIfAny(node, identation, forStm);
  }
  printBreakStatement(node, identation) {
    const breakStm = this.getIden(identation) + this.BREAK_TOKEN + this.LINE_TERMINATOR;
    return this.printNodeCommentsIfAny(node, identation, breakStm);
  }
  printPostFixUnaryExpression(node, identation) {
    const { operand, operator } = node;
    return this.getIden(identation) + this.printNode(operand, 0) + this.PostFixOperators[operator];
  }
  printPrefixUnaryExpression(node, identation) {
    const { operand, operator } = node;
    return this.getIden(identation) + this.PrefixFixOperators[operator] + this.printNode(operand, 0);
  }
  printObjectLiteralBody(node, identation) {
    let body = node.properties.map((p) => this.printNode(p, identation + 1)).join(",\n");
    body = body ? body + "," : body;
    return body;
  }
  printObjectLiteralExpression(node, identation) {
    const objectBody = this.printObjectLiteralBody(node, identation);
    const formattedObjectBody = objectBody ? "\n" + objectBody + "\n" + this.getIden(identation) : objectBody;
    return this.OBJECT_OPENING + formattedObjectBody + this.OBJECT_CLOSING;
  }
  printPropertyAssignment(node, identation) {
    const { name, initializer } = node;
    const nameAsString = this.printNode(name, 0);
    const valueAsString = this.printNode(initializer, identation);
    let trailingComment = this.printTraillingComment(node, identation);
    trailingComment = trailingComment ? " " + trailingComment : trailingComment;
    return this.getIden(identation) + nameAsString + this.PROPERTY_ASSIGNMENT_TOKEN + " " + valueAsString.trim() + trailingComment;
  }
  printElementAccessExpressionExceptionIfAny(node) {
    return void 0;
  }
  printElementAccessExpression(node, identation) {
    const { expression, argumentExpression } = node;
    const exception = this.printElementAccessExpressionExceptionIfAny(node);
    if (exception) {
      return exception;
    }
    const expressionAsString = this.printNode(expression, 0);
    const argumentAsString = this.printNode(argumentExpression, 0);
    return expressionAsString + "[" + argumentAsString + "]";
  }
  printIfStatement(node, identation) {
    const expression = this.printNode(node.expression, 0);
    const elseExists = node.elseStatement !== void 0;
    const isElseIf = node.parent.kind === ts.SyntaxKind.IfStatement;
    const needChainBlock = elseExists;
    const ifBody = this.printBlock(node.thenStatement, identation, needChainBlock);
    let ifComplete = this.CONDITION_OPENING + expression + this.CONDITION_CLOSE + ifBody;
    if (isElseIf) {
      ifComplete = this.ELSEIF_TOKEN + " " + ifComplete;
    } else {
      ifComplete = this.getIden(identation) + this.IF_TOKEN + " " + ifComplete;
    }
    const elseStatement = node.elseStatement;
    if (elseStatement?.kind === ts.SyntaxKind.Block) {
      const elseBody = this.printBlock(elseStatement, identation);
      const elseBlock = this.ELSE_TOKEN + elseBody;
      ifComplete += elseBlock;
    } else if (elseStatement?.kind === ts.SyntaxKind.IfStatement) {
      const elseBody = this.printIfStatement(elseStatement, identation);
      ifComplete += elseBody;
    }
    return this.printNodeCommentsIfAny(node, identation, ifComplete);
  }
  printParenthesizedExpression(node, identation) {
    return this.getIden(identation) + this.LEFT_PARENTHESIS + this.printNode(node.expression, 0) + this.RIGHT_PARENTHESIS;
  }
  printBooleanLiteral(node) {
    if (ts.SyntaxKind.TrueKeyword === node.kind) {
      return this.TRUE_KEYWORD;
    }
    return this.FALSE_KEYWORD;
  }
  printTryStatement(node, identation) {
    const tryBody = this.printBlock(node.tryBlock, identation, true);
    const catchBody = this.printBlock(node.catchClause.block, identation);
    const catchDeclaration = this.CATCH_DECLARATION + " " + this.printNode(node.catchClause.variableDeclaration.name, 0);
    const catchCondOpen = this.CONDITION_OPENING ? this.CONDITION_OPENING : " ";
    return this.getIden(identation) + this.TRY_TOKEN + tryBody + this.CATCH_TOKEN + catchCondOpen + catchDeclaration + this.CONDITION_CLOSE + catchBody;
  }
  printNewExpression(node, identation) {
    const expression = node.expression.escapedText;
    const args = node.arguments.map((n) => this.printNode(n, 0)).join(",");
    const newToken = this.NEW_TOKEN ? this.NEW_TOKEN + " " : "";
    return newToken + expression + this.LEFT_PARENTHESIS + args + this.RIGHT_PARENTHESIS;
  }
  printThrowStatement(node, identation) {
    const expression = this.printNode(node.expression, 0);
    return this.getIden(identation) + this.THROW_TOKEN + " " + expression + this.LINE_TERMINATOR;
  }
  printAwaitExpression(node, identation) {
    const expression = this.printNode(node.expression, 0);
    const awaitToken = this.asyncTranspiling ? this.AWAIT_TOKEN + " " : "";
    return this.getIden(identation) + awaitToken + expression;
  }
  printConditionalExpression(node, identation) {
    const condition = this.printNode(node.condition, 0);
    const whenTrue = this.printNode(node.whenTrue, 0);
    const whenFalse = this.printNode(node.whenFalse, 0);
    return this.getIden(identation) + whenTrue + " if " + condition + " else " + whenFalse;
  }
  printAsExpression(node, identation) {
    return this.printNode(node.expression, identation);
  }
  printReturnStatement(node, identation) {
    const leadingComment = this.printLeadingComments(node, identation);
    let trailingComment = this.printTraillingComment(node, identation);
    trailingComment = trailingComment ? " " + trailingComment : trailingComment;
    const exp = node.expression;
    let rightPart = exp ? " " + this.printNode(exp, identation) : "";
    rightPart = rightPart.trim();
    rightPart = rightPart ? " " + rightPart + this.LINE_TERMINATOR : this.LINE_TERMINATOR;
    return leadingComment + this.getIden(identation) + this.RETURN_TOKEN + rightPart + trailingComment;
  }
  printArrayBindingPattern(node, identation) {
    const elements = node.elements.map((e) => this.printNode(e.name, identation)).join(", ");
    return this.getIden(identation) + this.ARRAY_OPENING_TOKEN + elements + this.ARRAY_CLOSING_TOKEN;
  }
  printBlock(node, identation, chainBlock = false) {
    const blockOpen = this.getBlockOpen();
    const blockClose = this.getBlockClose(identation, chainBlock);
    const statements = node.statements.map((s) => this.printNode(s, identation + 1)).join("\n");
    return blockOpen + statements + blockClose;
  }
  printExpressionStatement(node, identation) {
    if (this.isCJSModuleExportsExpressionStatement(node)) {
      return "";
    }
    const expStatement = this.printNode(node.expression, identation) + this.LINE_TERMINATOR;
    return this.printNodeCommentsIfAny(node, identation, expStatement);
  }
  printPropertyDeclaration(node, identation) {
    let modifiers = this.printModifiers(node);
    modifiers = modifiers ? modifiers + " " : modifiers;
    const name = this.printNode(node.name, 0);
    const initializer = this.printNode(node.initializer, 0);
    return this.getIden(identation) + modifiers + name + " = " + initializer + this.LINE_TERMINATOR;
  }
  printNode(node, identation = 0) {
    try {
      if (ts.isExpressionStatement(node)) {
        return this.printExpressionStatement(node, identation);
      } else if (ts.isBlock(node)) {
        return this.printBlock(node, identation);
      } else if (ts.isFunctionDeclaration(node)) {
        return this.printFunctionDeclaration(node, identation);
      } else if (ts.isClassDeclaration(node)) {
        return this.printClass(node, identation);
      } else if (ts.isVariableStatement(node)) {
        return this.printVariableStatement(node, identation);
      } else if (ts.isMethodDeclaration(node)) {
        return this.printMethodDeclaration(node, identation);
      } else if (ts.isStringLiteral(node)) {
        return this.printStringLiteral(node);
      } else if (ts.isNumericLiteral(node)) {
        return this.printNumericLiteral(node);
      } else if (ts.isPropertyAccessExpression(node)) {
        return this.printPropertyAccessExpression(node, identation);
      } else if (ts.isArrayLiteralExpression(node)) {
        return this.printArrayLiteralExpression(node);
      } else if (ts.isCallExpression(node)) {
        return this.printCallExpression(node, identation);
      } else if (ts.isWhileStatement(node)) {
        return this.printWhileStatement(node, identation);
      } else if (ts.isBinaryExpression(node)) {
        return this.printBinaryExpression(node, identation);
      } else if (ts.isBreakStatement(node)) {
        return this.printBreakStatement(node, identation);
      } else if (ts.isForStatement(node)) {
        return this.printForStatement(node, identation);
      } else if (ts.isPostfixUnaryExpression(node)) {
        return this.printPostFixUnaryExpression(node, identation);
      } else if (ts.isVariableDeclarationList(node)) {
        return this.printVariableDeclarationList(node, identation);
      } else if (ts.isObjectLiteralExpression(node)) {
        return this.printObjectLiteralExpression(node, identation);
      } else if (ts.isPropertyAssignment(node)) {
        return this.printPropertyAssignment(node, identation);
      } else if (ts.isIdentifier(node)) {
        return this.printIdentifier(node);
      } else if (ts.isElementAccessExpression(node)) {
        return this.printElementAccessExpression(node, identation);
      } else if (ts.isIfStatement(node)) {
        return this.printIfStatement(node, identation);
      } else if (ts.isParenthesizedExpression(node)) {
        return this.printParenthesizedExpression(node, identation);
      } else if (ts.isBooleanLiteral(node)) {
        return this.printBooleanLiteral(node);
      } else if (ts.SyntaxKind.ThisKeyword === node.kind) {
        return this.THIS_TOKEN;
      } else if (ts.SyntaxKind.SuperKeyword === node.kind) {
        return this.SUPER_TOKEN;
      } else if (ts.isTryStatement(node)) {
        return this.printTryStatement(node, identation);
      } else if (ts.isPrefixUnaryExpression(node)) {
        return this.printPrefixUnaryExpression(node, identation);
      } else if (ts.isNewExpression(node)) {
        return this.printNewExpression(node, identation);
      } else if (ts.isThrowStatement(node)) {
        return this.printThrowStatement(node, identation);
      } else if (ts.isAwaitExpression(node)) {
        return this.printAwaitExpression(node, identation);
      } else if (ts.isConditionalExpression(node)) {
        return this.printConditionalExpression(node, identation);
      } else if (ts.isAsExpression(node)) {
        return this.printAsExpression(node, identation);
      } else if (ts.isReturnStatement(node)) {
        return this.printReturnStatement(node, identation);
      } else if (ts.isArrayBindingPattern(node)) {
        return this.printArrayBindingPattern(node, identation);
      } else if (ts.isParameter(node)) {
        return this.printParameter(node);
      } else if (ts.isConstructorDeclaration(node)) {
        return this.printConstructorDeclaration(node, identation);
      }
      if (ts.isPropertyDeclaration(node)) {
        return this.printPropertyDeclaration(node, identation);
      }
      if (node.statements) {
        const transformedStatements = node.statements.map((m) => {
          return this.printNode(m, identation + 1);
        });
        return transformedStatements.filter((st) => st.length > 0).join("\n") + "\n".repeat(this.NUM_LINES_END_FILE);
      }
      return "";
    } catch (e) {
      throw TranspilingError(e.messageText);
    }
  }
  getFileESMImports(node) {
    const result = [];
    const importStatements = node.statements.filter((s) => ts.isImportDeclaration(s));
    importStatements.forEach((node2) => {
      const importPath = node2.moduleSpecifier.text;
      const importClause = node2.importClause;
      const namedImports = importClause.namedBindings;
      if (namedImports) {
        namedImports.elements.forEach((elem) => {
          const name = elem.name.text;
          const fileImport = {
            name,
            path: importPath,
            isDefault: false
          };
          result.push(fileImport);
        });
      } else {
        const name = importClause.name.text;
        const fileImport = {
          name,
          path: importPath,
          isDefault: true
        };
        result.push(fileImport);
      }
    });
    return result;
  }
  isCJSRequireStatement(node) {
    const dec = node.declarationList.declarations[0];
    return ts.isCallExpression(dec.initializer) && dec.initializer.expression.getText() === "require";
  }
  isCJSModuleExportsExpressionStatement(node) {
    if (node.expression && node.expression.kind === ts.SyntaxKind.BinaryExpression) {
      if (node.expression.left.kind === ts.SyntaxKind.PropertyAccessExpression) {
        const left = node.expression.left;
        return left.expression.getText() === "module" && left.name.getText() === "exports";
      }
    }
    return false;
  }
  getCJSImports(node) {
    const result = [];
    const varStatements = node.statements.filter((s) => ts.isVariableStatement(s));
    const decList = varStatements.map((s) => s.declarationList);
    const dec = decList.map((d) => d.declarations[0]);
    dec.forEach((decNode) => {
      if (decNode.initializer.kind === ts.SyntaxKind.CallExpression) {
        const callExpression = decNode.initializer.expression.getText();
        if (callExpression === "require") {
          const isDefault = decNode.name.kind === ts.SyntaxKind.Identifier;
          const importPath = decNode.initializer.arguments[0].text;
          if (isDefault) {
            const name = decNode.name.text;
            const fileImport = {
              name,
              path: importPath,
              isDefault
            };
            result.push(fileImport);
          } else {
            const elems = decNode.name.elements;
            elems.forEach((elem) => {
              const name = elem.name.text;
              const fileImport = {
                name,
                path: importPath,
                isDefault: false
              };
              result.push(fileImport);
            });
          }
        }
      }
    });
    return result;
  }
  getFileImports(node) {
    const esmImports = this.getFileESMImports(node);
    if (esmImports.length > 0) {
      return esmImports;
    }
    const cjsImports = this.getCJSImports(node);
    return cjsImports;
  }
  getESMExports(node) {
    const result = [];
    const namedExports = node.statements.filter((s) => ts.isExportDeclaration(s));
    const defaultExport = node.statements.filter((s) => ts.isExportAssignment(s));
    namedExports.forEach((node2) => {
      const namedExports2 = node2.exportClause;
      if (namedExports2) {
        namedExports2.elements.forEach((elem) => {
          const name = elem.name.text;
          const fileExport = {
            name,
            isDefault: false
          };
          result.push(fileExport);
        });
      }
    });
    defaultExport.forEach((node2) => {
      const name = node2.expression.getText();
      const fileExport = {
        name,
        isDefault: true
      };
      result.push(fileExport);
    });
    return result;
  }
  getCJSExports(node) {
    const result = [];
    const moduleExports = node.statements.filter((s) => this.isCJSModuleExportsExpressionStatement(s)).map((s) => s.expression);
    moduleExports.forEach((node2) => {
      const right = node2.right;
      if (right.kind === ts.SyntaxKind.ObjectLiteralExpression) {
        const props = right.properties;
        props.forEach((prop) => {
          const name = prop.name.getText();
          const fileExport = {
            name,
            isDefault: false
          };
          result.push(fileExport);
        });
      }
      if (right.kind === ts.SyntaxKind.Identifier) {
        const name = right.getText();
        const fileExport = {
          name,
          isDefault: true
        };
        result.push(fileExport);
      }
    });
    return result;
  }
  getExportDeclarations(node) {
    const result = [];
    const classDeclarations = node.statements.filter((s) => ts.isClassDeclaration(s));
    const functionDeclarations = node.statements.filter((s) => ts.isFunctionDeclaration(s));
    const both = classDeclarations.concat(functionDeclarations);
    both.forEach((classNode) => {
      const modifiers = classNode.modifiers;
      if (modifiers) {
        const isDefault = modifiers.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
        if (isDefault) {
          const name = classNode.name.text;
          const fileExport = {
            name,
            isDefault: true
          };
          result.push(fileExport);
        }
      }
    });
    return result;
  }
  getFileExports(node) {
    const defaultClassAndFunctionsExports = this.getExportDeclarations(node);
    const esmExports = this.getESMExports(node).concat(defaultClassAndFunctionsExports);
    if (esmExports.length > 0) {
      return esmExports;
    }
    return this.getCJSExports(node);
  }
};

// src/pythonTranspiler.ts
import ts2 from "typescript";
var SyntaxKind = ts2.SyntaxKind;
var parserConfig = {
  "STATIC_TOKEN": "",
  "PUBLIC_KEYWORD": ""
};
var PythonTranspiler = class extends BaseTranspiler {
  constructor(config = {}) {
    config["parser"] = Object.assign({}, parserConfig, config["parser"] ?? {});
    super(config);
    this.initConfig();
    this.asyncTranspiling = config["async"] ?? true;
    this.uncamelcaseIdentifiers = config["uncamelcaseIdentifiers"] ?? false;
    this.applyUserOverrides(config);
  }
  initConfig() {
    this.LeftPropertyAccessReplacements = {
      "this": "self"
    };
    this.RightPropertyAccessReplacements = {
      "push": "append",
      "toUpperCase": "upper",
      "toLowerCase": "lower",
      "parseFloat": "float",
      "parseInt": "int",
      "indexOf": "find",
      "padEnd": "ljust",
      "padStart": "rjust"
    };
    this.FullPropertyAccessReplacements = {
      "console.log": "print",
      "JSON.stringify": "json.dumps",
      "JSON.parse": "json.loads",
      "Math.log": "math.log",
      "Math.abs": "abs",
      "Math.min": "min",
      "Math.max": "max",
      "Math.ceil": "math.ceil",
      "Math.round": "math.round",
      "Math.floor": "math.floor",
      "Math.pow": "math.pow",
      "process.exit": "sys.exit",
      "Number.MAX_SAFE_INTEGER": "float('inf')"
    };
    this.CallExpressionReplacements = {
      "parseInt": "int",
      "parseFloat": "float"
    };
    this.PropertyAccessRequiresParenthesisRemoval = [
      "length",
      "toString"
    ];
  }
  printOutOfOrderCallExpressionIfAny(node, identation) {
    const expressionText = node.expression.getText();
    const args = node.arguments;
    let finalExpression = void 0;
    switch (expressionText) {
      case "Array.isArray":
        finalExpression = "isinstance(" + this.printNode(args[0], 0) + ", list)";
        break;
      case "Math.floor":
        finalExpression = "int(math.floor(" + this.printNode(args[0], 0) + "))";
        break;
      case "Object.keys":
        finalExpression = "list(" + this.printNode(args[0], 0) + ".keys())";
        break;
      case "Object.values":
        finalExpression = "list(" + this.printNode(args[0], 0) + ".values())";
        break;
      case "Math.round":
        finalExpression = "int(round(" + this.printNode(args[0], 0) + "))";
        break;
      case "Math.ceil":
        finalExpression = "int(math.ceil(" + this.printNode(args[0], 0) + "))";
        break;
      case "Promise.all":
        finalExpression = "asyncio.gather(*" + this.printNode(args[0], 0) + ")";
        break;
    }
    if (finalExpression) {
      return this.getIden(identation) + finalExpression;
    }
    const letfSide = node.expression.expression;
    const rightSide = node.expression.name?.escapedText;
    if (rightSide === "shift") {
      return this.getIden(identation) + this.printNode(letfSide, 0) + ".pop(0)";
    }
    const arg = args && args.length > 0 ? args[0] : void 0;
    if (letfSide && arg) {
      const argText = this.printNode(arg, 0);
      const leftSideText = this.printNode(letfSide, 0);
      switch (rightSide) {
        case "includes":
          return this.getIden(identation) + argText + " in " + leftSideText;
        case "join":
          return this.getIden(identation) + argText + ".join(" + leftSideText + ")";
        case "split":
          return this.getIden(identation) + leftSideText + ".split(" + argText + ")";
      }
    }
    return void 0;
  }
  printElementAccessExpressionExceptionIfAny(node) {
    if (node.expression.kind === SyntaxKind.ThisKeyword) {
      return "getattr(self, " + this.printNode(node.argumentExpression, 0) + ")";
    }
  }
  printForStatement(node, identation) {
    const varName = node.initializer.declarations[0].name.escapedText;
    const initValue = this.printNode(node.initializer.declarations[0].initializer, 0);
    const roofValue = this.printNode(node.condition.right, 0);
    const forStm = this.getIden(identation) + this.FOR_TOKEN + " " + varName + " in range(" + initValue + ", " + roofValue + "):\n" + node.statement.statements.map((st) => this.printNode(st, identation + 1)).join("\n");
    return this.printNodeCommentsIfAny(node, identation, forStm);
  }
  transformLeadingComment(comment) {
    const commentRegex = [
      [/(^|\s)\/\//g, "$1#"],
      [/\/\*\*/, '"""'],
      [/ \*\//, '"""'],
      [/\[([^\[\]]*)\]\{@link (.*)\}/g, "`$1 <$2>`"],
      [/\s+\* @method/g, ""],
      [/(\s+) \* @description (.*)/g, "$1$2"],
      [/\s+\* @name .*/g, ""],
      [/(\s+) \* @see( .*)/g, "$1see$2"],
      [/(\s+ \* @(param|returns) {[^}]*)string([^}]*}.*)/g, "$1str$3"],
      [/(\s+ \* @(param|returns) {[^}]*)object([^}]*}.*)/g, "$1dict$3"],
      [/(\s+) \* @returns ([^\{])/g, "$1:returns: $2"],
      [/(\s+) \* @returns \{(.+)\}/g, "$1:returns $2:"],
      [/(\s+ \* @param \{[\]\[\|a-zA-Z]+\} )([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+) (.*)/g, "$1$2['$3'] $4"],
      [/(\s+) \* @([a-z]+) \{([\]\[a-zA-Z\|]+)\} ([a-zA-Z0-9_\-\.\[\]\']+)/g, "$1:$2 $3 $4:"]
    ];
    const transformed = regexAll(comment, commentRegex);
    return transformed;
  }
  transformTrailingComment(comment) {
    const commentRegex = [
      [/(^|\s)\/\//g, "$1#"]
    ];
    const transformed = regexAll(comment, commentRegex);
    return " " + transformed;
  }
  transformPropertyAcessExpressionIfNeeded(node) {
    const expression = node.expression;
    const leftSide = this.printNode(expression, 0);
    const rightSide = node.name.escapedText;
    let rawExpression = void 0;
    if (rightSide === "length") {
      rawExpression = "len(" + leftSide + ")";
    } else if (rightSide === "toString") {
      rawExpression = "str(" + leftSide + ")";
    }
    return rawExpression;
  }
  printClassDefinition(node, identation) {
    const className = node.name.escapedText;
    const heritageClauses = node.heritageClauses;
    let classInit = "";
    if (heritageClauses !== void 0) {
      const classExtends = heritageClauses[0].types[0].expression.escapedText;
      classInit = this.getIden(identation) + "class " + className + "(" + classExtends + "):\n";
    } else {
      classInit = this.getIden(identation) + "class " + className + ":\n";
    }
    return classInit;
  }
  printMethodParameters(node) {
    let parsedArgs = super.printMethodParameters(node);
    parsedArgs = parsedArgs ? "self, " + parsedArgs : "self";
    return parsedArgs;
  }
  printInstanceOfExpression(node, identation) {
    const left = this.printNode(node.left, 0);
    const right = this.printNode(node.right, 0);
    return this.getIden(identation) + `isinstance(${left}, ${right})`;
  }
  handleTypeOfInsideBinaryExpression(node, identation) {
    const expression = node.left.expression;
    const right = node.right.text;
    const op = node.operatorToken.kind;
    const isDifferentOperator = op === SyntaxKind.ExclamationEqualsEqualsToken || op === SyntaxKind.ExclamationEqualsToken;
    const notOperator = isDifferentOperator ? this.NOT_TOKEN : "";
    switch (right) {
      case "string":
        return this.getIden(identation) + notOperator + "isinstance(" + this.printNode(expression, 0) + ", str)";
      case "number":
        return this.getIden(identation) + notOperator + "isinstance(" + this.printNode(expression, 0) + ", numbers.Real)";
      case "boolean":
        return this.getIden(identation) + notOperator + "isinstance(" + this.printNode(expression, 0) + ", bool)";
      case "object":
        return this.getIden(identation) + notOperator + "isinstance(" + this.printNode(expression, 0) + ", dict)";
    }
    return void 0;
  }
  printCustomBinaryExpressionIfAny(node, identation) {
    const left = node.left;
    const right = node.right.text;
    const op = node.operatorToken.kind;
    if (left.kind === SyntaxKind.TypeOfExpression) {
      const typeOfExpression = this.handleTypeOfInsideBinaryExpression(node, identation);
      if (typeOfExpression) {
        return typeOfExpression;
      }
    }
    const prop = node?.left?.expression?.name?.text;
    if (prop) {
      const args = left.arguments;
      const parsedArg = args && args.length > 0 ? this.printNode(args[0], 0) : void 0;
      const leftSideOfIndexOf = left.expression.expression;
      const leftSide = this.printNode(leftSideOfIndexOf, 0);
      switch (prop) {
        case "indexOf":
          if (op === SyntaxKind.GreaterThanEqualsToken && right === "0") {
            return this.getIden(identation) + `${parsedArg} in ${leftSide}`;
          }
      }
    }
    return void 0;
  }
  getCustomOperatorIfAny(left, right, operator) {
    const rightText = right.getText();
    const isUndefined = rightText === "undefined";
    if (isUndefined) {
      switch (operator.kind) {
        case ts2.SyntaxKind.EqualsEqualsToken:
          return "is";
        case ts2.SyntaxKind.ExclamationEqualsToken:
          return "is not";
        case ts2.SyntaxKind.ExclamationEqualsEqualsToken:
          return "is not";
        case ts2.SyntaxKind.EqualsEqualsEqualsToken:
          return "is";
      }
    }
  }
};

// src/phpTranspiler.ts
import ts3 from "typescript";
var SyntaxKind2 = ts3.SyntaxKind;
var parserConfig2 = {
  "ELSEIF_TOKEN": "elseif",
  "THIS_TOKEN": "$this",
  "AMPERSTAND_APERSAND_TOKEN": "&&",
  "BAR_BAR_TOKEN": "||",
  "TRUE_KEYWORD": "true",
  "FALSE_KEYWORD": "false",
  "PROPERTY_ACCESS_TOKEN": "->",
  "UNDEFINED_TOKEN": "null",
  "IF_COND_CLOSE": ")",
  "IF_COND_OPEN": "(",
  "IF_OPEN": "{",
  "IF_CLOSE": "}",
  "NOT_TOKEN": "!",
  "ELSE_OPEN_TOKEN": " {",
  "ELSE_CLOSE_TOKEN": "}",
  "LINE_TERMINATOR": ";",
  "ARRAY_OPENING_TOKEN": "[",
  "ARRAY_CLOSING_TOKEN": "]",
  "OBJECT_OPENING": "array(",
  "OBJECT_CLOSING": ")",
  "FUNCTION_TOKEN": "function",
  "FUNCTION_DEF_OPEN": "{",
  "FUNCTION_CLOSE": "}",
  "ASYNC_TOKEN": "",
  "WHILE_COND_OPEN": "(",
  "WHILE_COND_CLOSE": ")",
  "WHILE_CLOSE": "}",
  "WHILE_OPEN": "{",
  "PROPERTY_ASSIGNMENT_TOKEN": " =>",
  "NEW_TOKEN": "new",
  "THROW_TOKEN": "throw",
  "SUPER_TOKEN": "parent",
  "CLASS_CLOSING_TOKEN": "}",
  "CLASS_OPENING_TOKEN": "{",
  "CONSTRUCTOR_TOKEN": "function __construct",
  "SUPER_CALL_TOKEN": "parent::__construct",
  "CATCH_DECLARATION": "Exception",
  "CATCH_OPEN": "{",
  "CATCH_CLOSE": "}",
  "TRY_OPEN": "{",
  "TRY_CLOSE": "}",
  "CATCH_COND_OPEN": "(",
  "CATCH_COND_CLOSE": ")",
  "CATCH_TOKEN": "catch",
  "BLOCK_OPENING_TOKEN": "{",
  "BLOCK_CLOSING_TOKEN": "}",
  "SPACE_BEFORE_BLOCK_OPENING": " ",
  "CONDITION_OPENING": "(",
  "CONDITION_CLOSE": ")",
  "PLUS_PLUS_TOKEN": "++",
  "MINUS_MINUS_TOKEN": "--",
  "SPACE_DEFAULT_PARAM": " ",
  "EXCLAMATION_EQUALS_EQUALS_TOKEN": "!==",
  "EQUALS_EQUALS_EQUALS_TOKEN": "==="
};
var PhpTranspiler = class extends BaseTranspiler {
  constructor(config = {}) {
    config["parser"] = Object.assign({}, parserConfig2, config["parser"] ?? {});
    super(config);
    this.ASYNC_FUNCTION_WRAPPER_OPEN = "";
    this.asyncTranspiling = config["async"] ?? true;
    this.uncamelcaseIdentifiers = config["uncamelcaseIdentifiers"] ?? false;
    this.propRequiresScopeResolutionOperator = ["super"] + (config["ScopeResolutionProps"] ?? []);
    this.initConfig();
    this.applyUserOverrides(config);
    this.AWAIT_WRAPPER_OPEN = config["AWAIT_WRAPPER_OPEN"] ?? "Async\\await(";
    this.AWAIT_WRAPPER_CLOSE = config["AWAIT_WRAPPER_CLOSE"] ?? ")";
  }
  printAwaitExpression(node, identation) {
    const expression = this.printNode(node.expression, 0);
    if (!this.asyncTranspiling) {
      return this.getIden(identation) + expression;
    }
    return this.getIden(identation) + this.AWAIT_WRAPPER_OPEN + expression + this.AWAIT_WRAPPER_CLOSE;
  }
  transformIdentifier(identifier) {
    if (this.uncamelcaseIdentifiers) {
      identifier = unCamelCase(identifier) ?? identifier;
    }
    return "$" + identifier;
  }
  getCustomOperatorIfAny(left, right, operator) {
    const STRING_CONCAT = ".";
    const PLUS_EQUALS_TOKEN = ".=";
    if (operator.kind == SyntaxKind2.PlusToken || operator.kind == SyntaxKind2.PlusEqualsToken) {
      const TOKEN = operator.kind == SyntaxKind2.PlusToken ? STRING_CONCAT : PLUS_EQUALS_TOKEN;
      if (left.kind == SyntaxKind2.StringLiteral || right.kind == SyntaxKind2.StringLiteral) {
        return TOKEN;
      }
      const leftType = global.checker.getTypeAtLocation(left);
      const rightType = global.checker.getTypeAtLocation(right);
      if (leftType.flags === ts3.TypeFlags.String || rightType.flags === ts3.TypeFlags.String) {
        return TOKEN;
      }
      if (leftType.flags === ts3.TypeFlags.StringLiteral || rightType.flags === ts3.TypeFlags.StringLiteral) {
        return TOKEN;
      }
    }
    return void 0;
  }
  transformPropertyAcessExpressionIfNeeded(node) {
    const expression = node.expression;
    const leftSide = this.printNode(expression, 0);
    const rightSide = node.name.escapedText;
    let rawExpression = void 0;
    switch (rightSide) {
      case "length":
        const type = global.checker.getTypeAtLocation(expression);
        this.warnIfAnyType(type.flags, leftSide, "length");
        rawExpression = this.isStringType(type.flags) ? "strlen(" + leftSide + ")" : "count(" + leftSide + ")";
        break;
    }
    return rawExpression;
  }
  transformPropertyInsideCallExpressionIfNeeded(node) {
    const expression = node.expression;
    const leftSide = this.printNode(expression, 0);
    const rightSide = node.name.escapedText;
    let rawExpression = void 0;
    switch (rightSide) {
      case "toString":
        rawExpression = "(string) " + leftSide;
        break;
      case "toUpperCase":
        rawExpression = "strtoupper(" + leftSide + ")";
        break;
      case "toLowerCase":
        rawExpression = "strtolower(" + leftSide + ")";
        break;
      case "shift":
        rawExpression = "array_shift(" + leftSide + ")";
        break;
      case "pop":
        rawExpression = "array_pop(" + leftSide + ")";
        break;
    }
    return rawExpression;
  }
  printOutOfOrderCallExpressionIfAny(node, identation) {
    if (node.expression.kind === ts3.SyntaxKind.PropertyAccessExpression) {
      const expressionText = node.expression.getText().trim();
      const args = node.arguments;
      if (args.length === 1) {
        const parsedArg = this.printNode(args[0], 0);
        switch (expressionText) {
          case "JSON.parse":
            return `json_decode(${parsedArg}, $as_associative_array = true)`;
          case "Array.isArray":
            return `gettype(${parsedArg}) === 'array' && array_keys(${parsedArg}) === array_keys(array_keys(${parsedArg}))`;
          case "Object.keys":
            return `is_array(${parsedArg}) ? array_keys(${parsedArg}) : array()`;
          case "Object.values":
            return `is_array(${parsedArg}) ? array_values(${parsedArg}) : array()`;
        }
      }
      const transformedProp = this.transformPropertyInsideCallExpressionIfNeeded(node.expression);
      if (transformedProp) {
        return transformedProp;
      }
      const leftSide = node.expression?.expression;
      const rightSide = node.expression.name?.escapedText;
      const arg = args && args.length > 0 ? args[0] : void 0;
      if (arg) {
        const argText = this.printNode(arg, identation).trimStart();
        const leftSideText = this.printNode(leftSide, 0);
        const type = global.checker.getTypeAtLocation(leftSide);
        switch (rightSide) {
          case "push":
            return leftSideText + "[] = " + argText;
          case "includes":
            this.warnIfAnyType(type.flags, leftSideText, "includes");
            if (this.isStringType(type.flags)) {
              return "str_contains(" + leftSideText + ", " + argText + ")";
            } else {
              return "in_array(" + argText + ", " + leftSideText + ")";
            }
          case "indexOf":
            this.warnIfAnyType(type.flags, leftSideText, "indexOf");
            if (this.isStringType(type.flags)) {
              return "mb_strpos(" + leftSideText + ", " + argText + ")";
            } else {
              return "array_search(" + argText + ", " + leftSideText + ")";
            }
          case "join":
            return "implode(" + argText + ", " + leftSideText + ")";
          case "split":
            return "explode(" + argText + ", " + leftSideText + ")";
        }
      }
    }
    return void 0;
  }
  getExceptionalAccessTokenIfAny(node) {
    const leftSide = node.expression.escapedText ?? node.expression.getFullText().trim();
    if (!leftSide) {
      return void 0;
    }
    if (this.propRequiresScopeResolutionOperator.includes(leftSide)) {
      return "::";
    }
    return void 0;
  }
  printConditionalExpression(node, identation) {
    const condition = this.printNode(node.condition, 0);
    const whenTrue = this.printNode(node.whenTrue, 0);
    const whenFalse = this.printNode(node.whenFalse, 0);
    return this.getIden(identation) + condition + " ? " + whenTrue + " : " + whenFalse;
  }
  handleTypeOfInsideBinaryExpression(node, identation) {
    const left = node.left;
    const right = node.right.text;
    const op = node.operatorToken.kind;
    const expression = left.expression;
    const isDifferentOperator = op === SyntaxKind2.ExclamationEqualsEqualsToken || op === SyntaxKind2.ExclamationEqualsToken;
    const notOperator = isDifferentOperator ? this.NOT_TOKEN : "";
    switch (right) {
      case "string":
        return this.getIden(identation) + notOperator + "is_string(" + this.printNode(expression, 0) + ")";
      case "number":
        return this.getIden(identation) + notOperator + "(is_int(" + this.printNode(expression, 0) + ") || is_float(" + this.printNode(expression, 0) + "))";
      case "boolean":
        return this.getIden(identation) + notOperator + "is_bool(" + this.printNode(expression, 0) + ")";
      case "object":
        return this.getIden(identation) + notOperator + "is_array(" + this.printNode(expression, 0) + ")";
    }
    return void 0;
  }
  printCustomBinaryExpressionIfAny(node, identation) {
    const left = node.left;
    const right = node.right.text;
    const op = node.operatorToken.kind;
    if (left.kind === SyntaxKind2.TypeOfExpression) {
      const typeOfExpression = this.handleTypeOfInsideBinaryExpression(node, identation);
      if (typeOfExpression) {
        return typeOfExpression;
      }
    }
    const prop = node?.left?.expression?.name?.text;
    if (prop) {
      const args = left.arguments;
      const parsedArg = args && args.length > 0 ? this.printNode(args[0], 0) : void 0;
      const leftSideOfIndexOf = left.expression.expression;
      const leftSide = this.printNode(leftSideOfIndexOf, 0);
      const rightType = global.checker.getTypeAtLocation(leftSideOfIndexOf);
      switch (prop) {
        case "indexOf":
          if (op === SyntaxKind2.GreaterThanEqualsToken && right === "0") {
            this.warnIfAnyType(rightType.flags, leftSide, "indexOf");
            if (this.isStringType(rightType.flags)) {
              return this.getIden(identation) + "mb_strpos(" + leftSide + ", " + parsedArg + ") !== false";
            } else {
              return this.getIden(identation) + "in_array(" + parsedArg + ", " + leftSide + ")";
            }
          }
      }
    }
    return void 0;
  }
  isComment(line) {
    line = line.trim();
    return line.startsWith("//") || line.startsWith("/*") || line.startsWith("*");
  }
  printFunctionBody(node, identation) {
    if (this.asyncTranspiling && this.isAsyncFunction(node)) {
      const blockOpen = this.getBlockOpen();
      const blockClose = this.getBlockClose(identation);
      const parsedArgs = node.parameters.map((param) => this.printParameter(param, false)).join(", ");
      const params = parsedArgs ? " use (" + parsedArgs + ")" : "";
      const bodyStms = node.body.statements;
      const firstBodyStm = this.printNode(bodyStms[0], identation + 2);
      bodyStms.shift();
      const funcBody = bodyStms.map((s) => this.printNode(s, identation + 2)).join("\n");
      const bodyParts = firstBodyStm.split("\n");
      const commentPart = bodyParts.filter((line) => this.isComment(line));
      const isComment = commentPart.length > 0;
      let header = this.getIden(identation + 1) + "return Async\\async(function ()" + params + " {\n";
      if (isComment) {
        const commentPartString = commentPart.map((c) => this.getIden(identation + 1) + c.trim()).join("\n");
        const firstStmNoComment = bodyParts.filter((line) => !this.isComment(line)).join("\n");
        header = commentPartString + "\n" + header + firstStmNoComment + "\n";
      } else {
        header += firstBodyStm + "\n";
      }
      const result = header + funcBody + "\n" + this.getIden(identation + 1) + "}) ();";
      return blockOpen + result + blockClose;
    }
    return super.printFunctionBody(node, identation);
  }
  transformLeadingComment(comment) {
    const commentRegex = [
      [/\{([\]\[\|a-zA-Z0-9_-]+?)\}/g, "~$1~"],
      [/\[([^\]\[]*)\]\{(@link .*)\}/g, "~$2 $1~"],
      [/\s+\* @method/g, ""],
      [/(\s+)\* @description (.*)/g, "$1* $2"],
      [/\s+\* @name .*/g, ""],
      [/(\s+)\* @returns/g, "$1* @return"],
      [/\~([\]\[\|@\.\s+\:\/#\-a-zA-Z0-9_-]+?)\~/g, "{$1}"],
      [/(\s+ \* @(param|return) {[^}]*)object([^}]*}.*)/g, "$1array$3"]
    ];
    const transformed = regexAll(comment, commentRegex);
    return transformed;
  }
  initConfig() {
    this.LeftPropertyAccessReplacements = {
      "this": "$this"
    };
    this.RightPropertyAccessReplacements = {};
    this.FullPropertyAccessReplacements = {
      "Number.MAX_SAFE_INTEGER": "PHP_INT_MAX",
      "JSON.stringify": "json_encode",
      "console.log": "var_dump",
      "process.exit": "exit",
      "Math.log": "log",
      "Math.abs": "abs",
      "Math.floor": "(int) floor",
      "Math.ceil": "(int) ceil",
      "Math.round": "(int) round",
      "Math.pow": "pow",
      "Math.min": "min",
      "Math.max": "max",
      "Promise.all": "Promise\\all"
    };
    this.CallExpressionReplacements = {
      "parseFloat": "floatval",
      "parseInt": "intval"
    };
    this.PropertyAccessRequiresParenthesisRemoval = [];
  }
};

// src/transpiler.ts
import * as path from "path";
var __dirname_mock = import_dirname.default;
function getProgramAndTypeCheckerFromMemory(rootDir, text, options = {}) {
  options = options || ts4.getDefaultCompilerOptions();
  const inMemoryFilePath = path.resolve(path.join(rootDir, "__dummy-file.ts"));
  const textAst = ts4.createSourceFile(inMemoryFilePath, text, options.target || ts4.ScriptTarget.Latest);
  const host = ts4.createCompilerHost(options, true);
  function overrideIfInMemoryFile(methodName, inMemoryValue) {
    const originalMethod = host[methodName];
    host[methodName] = (...args) => {
      const filePath = path.resolve(args[0]);
      if (filePath === inMemoryFilePath)
        return inMemoryValue;
      return originalMethod.apply(host, args);
    };
  }
  overrideIfInMemoryFile("getSourceFile", textAst);
  overrideIfInMemoryFile("readFile", text);
  overrideIfInMemoryFile("fileExists", true);
  const program = ts4.createProgram({
    options,
    rootNames: [inMemoryFilePath],
    host
  });
  const typeChecker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(inMemoryFilePath);
  return [program, typeChecker, sourceFile];
}
var Transpiler = class {
  constructor(config = {}) {
    this.config = config;
    const phpConfig = config["php"] || {};
    const pythonConfig = config["python"] || {};
    if ("verbose" in config) {
      Logger.setVerboseMode(config["verbose"]);
    }
    this.pythonTranspiler = new PythonTranspiler(pythonConfig);
    this.phpTranspiler = new PhpTranspiler(phpConfig);
  }
  setVerboseMode(verbose) {
    Logger.setVerboseMode(verbose);
  }
  createProgramInMemoryAndSetGlobals(content) {
    const [memProgram, memType, memSource] = getProgramAndTypeCheckerFromMemory(__dirname_mock, content);
    global.src = memSource;
    global.checker = memType;
    global.program = memProgram;
  }
  createProgramByPathAndSetGlobals(path2) {
    const program = ts4.createProgram([path2], {});
    const sourceFile = program.getSourceFile(path2);
    const typeChecker = program.getTypeChecker();
    global.src = sourceFile;
    global.checker = typeChecker;
    global.program = program;
  }
  checkFileDiagnostics() {
    const diagnostics = ts4.getPreEmitDiagnostics(global.program, global.src);
    if (diagnostics.length > 0) {
      let errorMessage = "Errors found in the typescript code. Transpilation might produce invalid results:\n";
      diagnostics.forEach((msg) => {
        errorMessage += "  - " + msg.messageText + "\n";
      });
      Logger.warning(errorMessage);
    }
  }
  transpile(lang, mode, file) {
    if (mode === 0 /* ByPath */) {
      this.createProgramByPathAndSetGlobals(file);
    } else {
      this.createProgramInMemoryAndSetGlobals(file);
    }
    this.checkFileDiagnostics();
    let transpiledContent = void 0;
    switch (lang) {
      case 0 /* Python */:
        transpiledContent = this.pythonTranspiler.printNode(global.src, -1);
        break;
      case 1 /* Php */:
        transpiledContent = this.phpTranspiler.printNode(global.src, -1);
        break;
    }
    const imports = this.pythonTranspiler.getFileImports(global.src);
    const exports = this.pythonTranspiler.getFileExports(global.src);
    Logger.success("transpilation finished successfully");
    return {
      content: transpiledContent,
      imports,
      exports
    };
  }
  transpilePython(content) {
    return this.transpile(0 /* Python */, 1 /* ByContent */, content);
  }
  transpilePythonByPath(path2) {
    return this.transpile(0 /* Python */, 0 /* ByPath */, path2);
  }
  transpilePhp(content) {
    return this.transpile(1 /* Php */, 1 /* ByContent */, content);
  }
  transpilePhpByPath(path2) {
    return this.transpile(1 /* Php */, 0 /* ByPath */, path2);
  }
  getFileImports(content) {
    this.createProgramInMemoryAndSetGlobals(content);
    return this.phpTranspiler.getFileImports(global.src);
  }
  getFileExports(content) {
    this.createProgramInMemoryAndSetGlobals(content);
    return this.phpTranspiler.getFileExports(global.src);
  }
  setPHPPropResolution(props) {
    this.phpTranspiler.propRequiresScopeResolutionOperator = props;
  }
  setPhpUncamelCaseIdentifiers(uncamelCase) {
    this.phpTranspiler.uncamelcaseIdentifiers = uncamelCase;
  }
  setPythonUncamelCaseIdentifiers(uncamelCase) {
    this.pythonTranspiler.uncamelcaseIdentifiers = uncamelCase;
  }
  setPhpAsyncTranspiling(async) {
    this.phpTranspiler.asyncTranspiling = async;
  }
  setPythonAsyncTranspiling(async) {
    this.pythonTranspiler.asyncTranspiling = async;
  }
  setPythonStringLiteralReplacements(replacements) {
    this.pythonTranspiler.StringLiteralReplacements = replacements;
  }
};
export {
  Transpiler,
  Transpiler as default
};
