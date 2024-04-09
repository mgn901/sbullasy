import {
  type ArrowFunction,
  type FunctionDeclaration,
  type MethodDeclaration,
  type MethodSignature,
  Node,
  Project,
  type Type,
  type TypeChecker,
  type ts,
} from 'ts-morph';

//#region types
/** 解決されたメソッドの引数および戻り値の型をまとめたインターフェース。 */
interface IResolvedMethodType {
  readonly tsMorphMethodNode:
    | MethodDeclaration
    | MethodSignature
    | FunctionDeclaration
    | ArrowFunction;
  readonly params: Type<ts.Type>;
  readonly returnType: Type<ts.Type>;
}

//#endregion

//#region utils
/** 型TのNodeを得られるまで型の解決を繰り返す。 */
const resolveOrThrow = <T extends Node>(param: {
  readonly node: Node<ts.Node>;
  readonly typeGuards: readonly ((value: Node<ts.Node>) => value is T)[];
  readonly typeChecker: TypeChecker;
}): T => {
  if (param.typeGuards.some((typeGuard) => typeGuard(param.node))) {
    return param.node as T;
  }
  const valueDeclaration = param.typeChecker
    .getTypeAtLocation(param.node)
    .getSymbolOrThrow()
    .getDeclarations()[0];
  // .getValueDeclarationOrThrow();

  return resolveOrThrow({ ...param, node: valueDeclaration });
};

/** エントリーポイントの引数および戻り値の型をを解決する。 */
const toEntryPointResolved = (param: {
  readonly type: Type<ts.Type>;
  readonly typeChecker: TypeChecker;
}): IResolvedMethodType => {
  const sourceNode = param.type.getProperty('method')?.getValueDeclaration();
  if (!sourceNode) {
    throw new Error('`method` in `default.entryPoints[number]` is necessary, but not defined.');
  }
  const methodNode = resolveOrThrow<MethodDeclaration | FunctionDeclaration | ArrowFunction>({
    node: sourceNode,
    typeGuards: [Node.isMethodDeclaration, Node.isFunctionDeclaration, Node.isArrowFunction],
    typeChecker: param.typeChecker,
  });

  const paramsType = methodNode.getParameters()[0]?.getType();
  if (!paramsType) {
    throw new Error(
      'The first parameter name of entry-point must be `param` and count of parameters must be one.',
    );
  }

  return {
    tsMorphMethodNode: methodNode,
    params: paramsType,
    returnType: methodNode.getReturnType(),
  };
};

/** サービスの引数および戻り値の型を解決する。 */
const toServiceResolved = (param: {
  readonly type: Type<ts.Type>;
  readonly typeChecker: TypeChecker;
}): IResolvedMethodType => {
  const sourceNode = param.type.getProperty('service')?.getValueDeclaration();
  if (!sourceNode) {
    throw new Error('`service` in `default.services[number]` is necessary, but not defined.');
  }
  const methodNode = resolveOrThrow<
    MethodDeclaration | MethodSignature | FunctionDeclaration | ArrowFunction
  >({
    node: sourceNode,
    typeGuards: [
      Node.isMethodDeclaration,
      Node.isMethodSignature,
      Node.isFunctionDeclaration,
      Node.isArrowFunction,
    ],
    typeChecker: param.typeChecker,
  });

  const paramsType = methodNode.getParameters()[0]?.getType();
  if (!paramsType) {
    throw new Error(
      'The first parameter name of entry-point must be `param` and count of parameters must be one.',
    );
  }

  return {
    tsMorphMethodNode: methodNode,
    params: paramsType,
    returnType: methodNode.getReturnType(),
  };
};

/** 型パラメータに対する制約を取得する。 */
const resolveTypeParameter = (param: { readonly type: Type<ts.Type> }) => {
  param.type.getSymbol();
};
//#endregion

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const configSourceFile = project.getSourceFileOrThrow('src/sbullasy-codegen.config.ts');
const entryPointsResolved = configSourceFile
  .getDefaultExportSymbolOrThrow() // default
  .getDeclaredType()
  .getPropertyOrThrow('entryPoints') // default.entryPoints
  .getValueDeclarationOrThrow()
  .getType()
  .getTupleElements()
  .map((type) => toEntryPointResolved({ type, typeChecker: project.getTypeChecker() }));
const servicesResolved = configSourceFile
  .getDefaultExportSymbolOrThrow() // default
  .getDeclaredType()
  .getPropertyOrThrow('services') // default.services
  .getValueDeclarationOrThrow()
  .getType()
  .getTupleElements()
  .map((type) => toServiceResolved({ type, typeChecker: project.getTypeChecker() }));
const containerMethodsResolved: IResolvedMethodType[] = configSourceFile
  .getDefaultExportSymbolOrThrow() // default
  .getDeclaredType()
  .getPropertyOrThrow('containers') // default.containers
  .getValueDeclarationOrThrow()
  .getType()
  .getTupleElements()
  .map((type) =>
    resolveOrThrow({
      node: type.getSymbolOrThrow().getMemberOrThrow('container').getDeclarations()[0],
      typeChecker: project.getTypeChecker(),
      typeGuards: [Node.isInterfaceDeclaration],
    }),
  )
  .flatMap((node) => node.getMembers()) // クラスを得られる。
  .flatMap((classType) => classType.getType().getSymbolOrThrow().getMembers()) // メンバーを得られる。
  .flatMap((memberSymbol) => memberSymbol.getDeclarations())
  .filter(Node.isMethodSignature)
  .map((memberNode) => ({
    tsMorphMethodNode: memberNode,
    params: memberNode.getParameters()[0].getType(),
    returnType: memberNode.getReturnType(),
  }));

/**
 * 渡された型のオブジェクトを得るために依存しているサービスを取得する。
 * @todo sbullasyのコードベースに依存
 */
const getDependentService = (param: {
  readonly type: Type<ts.Type>;
  readonly services: readonly IResolvedMethodType[];
  readonly typeChecker: TypeChecker;
}) => {
  const serviceParam = param.services.find((service, index) =>
    service.returnType.getSymbolOrThrow().getEscapedName() === 'Promise'
      ? service.returnType
          .getTypeArguments()[0] // Promiseの型引数
          .getAliasTypeArguments()[0] // TResultの型引数
          .getSymbolOrThrow()
          .getMembers()[0] // TResultの型引数の1番目のプロパティ
          ?.getValueDeclarationOrThrow() // 何も値を返さないことを想定しているサービスである場合、members[0]がundefinedになっている可能性がある。
          .getType()
          .isAssignableTo(param.type)
      : service.returnType
          .getTypeArguments()[0] // TResultの型引数
          .getSymbolOrThrow()
          .getMembers()[0] // TResultの型引数の1番目のプロパティ
          ?.getValueDeclarationOrThrow() // 何も値を返さないことを想定しているサービスである場合、members[0]がundefinedになっている可能性がある。
          .getType()
          .isAssignableTo(param.type),
  );
  return serviceParam;
};

export const tested = () => {
  const tree = entryPointsResolved.map((entryPoint) =>
    entryPoint.params.getProperties().map((param, index) => ({
      dependentService: getDependentService({
        type: param.getValueDeclarationOrThrow().getType(),
        services: servicesResolved,
        typeChecker: project.getTypeChecker(),
      }),
      dependentContainerService: getDependentService({
        type: param.getValueDeclarationOrThrow().getType(),
        services: containerMethodsResolved,
        typeChecker: project.getTypeChecker(),
      }),
    })),
  );
  console.log(tree);
};
