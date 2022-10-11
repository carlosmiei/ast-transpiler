let output = "";

const visitor = (node) => {
    if (ts.isAccessExpression(node)) {
        const leftType = checker.getTypeAtLocation(node.expression);
        const rightName = node.name.text;
        if (checker.isArrayType(leftType) && rightName === "length") output += `${node.expression.getText()}.len();` 
    } else {
        output += `${node.getText()};`;
    }
    ts.visitEachChild(node, visitor, context);
}
