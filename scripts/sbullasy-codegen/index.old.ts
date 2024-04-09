import { Node, Project, type Symbol as TsMorphSymbol, type TypeChecker } from 'ts-morph';

export class SbullasyCodegen {
  private project: Project;
  private configSymbol: TsMorphSymbol;
  private typeChecker: TypeChecker;

  public constructor() {
    this.project = new Project({ tsConfigFilePath: 'tsconfig.json' });
    this.typeChecker = this.project.getTypeChecker();
    this.configSymbol = this.project
      .getSourceFileOrThrow('src/sbullasy-codegen.config.ts')
      .getDefaultExportSymbolOrThrow();
  }

  public getEntryPoint(param: { readonly index: number }) {
    const entryPoints =
      this.configSymbol
        .getDeclaredType()
        .getProperty('entryPoints')
        ?.getValueDeclaration()
        ?.getType()
        .getTupleElements() ?? [];
    const entryPoint = entryPoints[0];
    if (entryPoint === undefined) {
      return undefined;
    }

    const methodType = entryPoint.getProperty('method')?.getValueDeclaration();
    if (methodType === undefined) {
      throw new Error('Invalid config file');
    }

    const methodTypeResolved = this.typeChecker.getTypeAtLocation(methodType);
    const methodDeclaration = methodTypeResolved.getSymbol()?.getValueDeclaration();
    if (
      !Node.isFunctionDeclaration(methodDeclaration) &&
      !Node.isMethodDeclaration(methodDeclaration)
    ) {
      throw new Error('Invalid config file');
    }
    return {
      param: methodDeclaration.getParameter('param')?.getType(),
      onSuccess: methodDeclaration.getReturnType().getTypeArguments()[0],
      onFailure: methodDeclaration.getReturnType().getTypeArguments()[1],
    };
  }

  public start() {
    const entryPoint0 = this.getEntryPoint({ index: 0 });
    console.log(entryPoint0);
  }
}
