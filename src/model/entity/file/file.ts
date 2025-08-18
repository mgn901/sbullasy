import { getMimeTypeFromStream } from '../../../utils/stream.ts';
import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type {
  AccessControlServiceDependencies,
  verifyAccessToken,
  verifyGroupMember,
} from '../../lib/access-control.ts';
import type {
  ClientContextMap,
  ContextRepository,
  LogInUserClientContextMap,
} from '../../lib/context.ts';
import { Exception } from '../../lib/exception.ts';
import { generateId, type Id } from '../../lib/random-values/id.ts';
import type { Filters, FromRepository, OrderBy } from '../../lib/repository.ts';
import type { PreApplied } from '../../lib/type-utils.ts';
import type { GroupId } from '../group/values.ts';

//#region FileMetadata and FileRepository
export const fileMetadataTypeSymbol = Symbol('fileMetadata.type');
export type FileId = NominalPrimitive<Id, typeof fileMetadataTypeSymbol>;
export type ImageMimeType = 'image/gif' | 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * ファイルのメタデータを表す。
 */
export type FileMetadata = {
  readonly [fileMetadataTypeSymbol]: typeof fileMetadataTypeSymbol;
  readonly id: FileId;
  readonly createdAt: Date;
  readonly ownedBy: GroupId;
};

/**
 * {@linkcode FileMetadata}の状態を変更するための関数を提供する。
 */
export const FileMetadataReducers = {
  /**
   * ファイルのメタデータを作成して返す。
   */
  create: <P extends { readonly ownedBy: TGroupId }, TGroupId extends GroupId>(
    params: P,
  ): FileMetadata & Pick<P, 'ownedBy'> =>
    ({
      [fileMetadataTypeSymbol]: fileMetadataTypeSymbol,
      id: generateId() as FileId,
      createdAt: new Date(),
      ownedBy: params.ownedBy,
    }) as const,
};

/**
 * {@linkcode FileMetadata}やファイルそのもののストリームを永続化するためのリポジトリ。
 */
export interface FileRepository {
  getOneById<TFileId extends FileId>(
    this: FileRepository,
    id: TFileId,
  ): Promise<FromRepository<FileMetadata & { readonly id: FileId }> | undefined>;

  getStreamById(this: FileRepository, id: FileId): Promise<ReadableStream<Uint8Array> | undefined>;

  getImageStreamById(
    this: FileRepository,
    params: {
      readonly fileId: FileId;
      readonly maxSize: number;
      readonly mimeType?: ImageMimeType | undefined;
    },
  ): ReadableStream<Uint8Array> | undefined;

  getMany(
    this: FileRepository,
    params: {
      readonly filters?: Filters<FileMetadata>;
      readonly orderBy: OrderBy<FileMetadata>;
      readonly offset?: number | undefined;
      readonly limit?: number | undefined;
    },
  ): Promise<readonly FromRepository<FileMetadata>[] | readonly []>;

  count(
    this: FileRepository,
    params: { readonly filters?: Filters<FileMetadata> },
  ): Promise<number>;

  createOne(
    this: FileRepository,
    metadata: FileMetadata,
    stream: ReadableStream<Uint8Array>,
  ): Promise<void>;

  deleteOneById(this: FileRepository, id: FileId): Promise<void>;

  deleteMany(
    this: FileRepository,
    params: { readonly filters: Filters<FileMetadata> },
  ): Promise<number>;
}
//#endregion

//#region FileService
export interface FileServiceDependencies {
  readonly verifyAccessToken: PreApplied<
    typeof verifyAccessToken,
    AccessControlServiceDependencies
  >;
  readonly verifyGroupMember: PreApplied<
    typeof verifyGroupMember,
    AccessControlServiceDependencies
  >;
  readonly fileRepository: FileRepository;
  readonly clientContextRepository: ContextRepository<ClientContextMap & LogInUserClientContextMap>;
}

/**
 * 指定されたIDのファイルを画像として取得する。
 * @throws 指定されたIDのファイルが存在しない場合、{@linkcode Exception}（`file.notExists`）を投げる。
 */
export const getImageStream = (
  params: {
    readonly fileId: FileId;
    readonly maxSize: number;
    readonly imageMimeType?: ImageMimeType | undefined;
  } & FileServiceDependencies,
): ReadableStream<Uint8Array> => {
  const stream = params.fileRepository.getImageStreamById({
    fileId: params.fileId,
    maxSize: params.maxSize,
    mimeType: params.imageMimeType,
  });
  if (stream === undefined) {
    throw Exception.create({ exceptionName: 'file.notExists' });
  }
  return stream;
};

/**
 * 指定されたグループが所有するファイルの一覧を取得する。
 * - この操作を行おうとするユーザは、グループのメンバーである必要がある。
 */
export const getMany = async (
  params: {
    readonly filters: Filters<FileMetadata> & { readonly ownedBy: GroupId };
    readonly orderBy: OrderBy<FileMetadata>;
    readonly offset?: number | undefined;
    readonly limit?: number | undefined;
  } & FileServiceDependencies,
): Promise<{
  readonly fileMetadataList: readonly FileMetadata[] | readonly [];
}> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyGroupMember({ groupId: params.filters.ownedBy, userId: myUserAccount.id });

  const fileMetadataList = await params.fileRepository.getMany({
    filters: params.filters,
    orderBy: params.orderBy,
    limit: params.limit,
    offset: params.offset,
  });

  return { fileMetadataList };
};

/**
 * 画像をアップロードする。
 * - この操作を行おうとするユーザは、画像のアップロード先グループのメンバーである必要がある。
 */
export const uploadImage = async (
  params: {
    readonly ownedBy: GroupId;
    readonly stream: ReadableStream<Uint8Array>;
  } & FileServiceDependencies,
): Promise<{ readonly fileMetadata: FileMetadata }> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });
  await params.verifyGroupMember({ groupId: params.ownedBy, userId: myUserAccount.id });

  const [streamForMimeTypeCheck, streamForRepository] = params.stream.tee();
  const mimeType = await getMimeTypeFromStream(streamForMimeTypeCheck);
  if (
    mimeType !== 'image/gif' &&
    mimeType !== 'image/jpeg' &&
    mimeType !== 'image/png' &&
    mimeType !== 'image/webp'
  ) {
    throw Exception.create({ exceptionName: 'file.mimeTypeInvalid' });
  }

  const fileMetadata = FileMetadataReducers.create({ ownedBy: params.ownedBy });
  await params.fileRepository.createOne(fileMetadata, streamForRepository);
  return { fileMetadata };
};

/**
 * 指定されたIDのファイルを削除する。
 * - この操作を行おうとするユーザは、ファイルの所有グループのメンバーである必要がある。
 */
export const deleteOne = async (
  params: { readonly id: FileId } & FileServiceDependencies,
): Promise<void> => {
  const { myUserAccount } = await params.verifyAccessToken({
    accessTokenSecret: params.clientContextRepository.get('client.accessTokenSecret'),
  });

  const fileMetadata = await params.fileRepository.getOneById(params.id);
  if (fileMetadata === undefined) {
    return;
  }

  await params.verifyGroupMember({ groupId: fileMetadata.ownedBy, userId: myUserAccount.id });

  await params.fileRepository.deleteOneById(fileMetadata.id);
};
//#endregion
