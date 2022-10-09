import * as ts from 'ts-morph';

const project = new ts.Project();

project.addSourceFilesAtPaths('src/**/*.ts');

const file = project.getSourceFiles()[0]

const classes = file.getClasses()

// function replace(text: ts.CodeBlockWriter) {
//     console.log(text);
//     return text
// }

project.getSourceFiles().forEach((sourceFile) => {
    const interfaces = sourceFile.getInterfaces();
    // sourceFile.method
    // ts.isVariableDeclaration[]
    // sourceFile.getClasses().forEach((classDeclaration) => {
    //     classDeclaration.getMethods().forEach((method) => {
    // }
    // project.getMethod

//    sourceFile.getVar 
    
    // sourceFile.getVariableDeclarations

    const declarations = sourceFile.getVariableDeclarations()
    const dec = declarations[0]
    const statements = sourceFile.getVariableStatements();
    const first = statements[0];
    const ide = first.getIndentationLevel()
    const init = dec.getInitializer();
    // init?.replaceWithText(replace);
    const y = statements[0].getDeclarationKindKeyword();
    // const y = sourceFile, 

    // interfaces.forEach((interfaceDeclaration) => {
    //     // const oldId = interfaceDeclaration.getProperty('_id');
    //     // console.log("HERE")

    //     // If it exists we delete it
    //     // if (oldId) {
    //     //     oldId.remove();
    
    //         // We create a new property in position 0, with the name 'id' and the type 'string'
    //         interfaceDeclaration.replaceWithText("myInterface")
    //         // interfaceDeclaration.insertProperty(0, {
    //         //   name: 'id',
    //         //   type: 'string',
    //         // })
    //     // }        
    // });

    const struct = sourceFile.getStructure();

    ts.forEachStructureChild(struct, child => {
        // if (Structure.hasName(child))
        //   console.log(child.name);
        child = child as any;
        console.log((child as any).declarationKind);
        console.log((child as any).declarations[0]['initializer'])
      });

    // We save the file with the changes
sourceFile.save();

});


