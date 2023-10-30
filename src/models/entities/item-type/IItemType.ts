import { JSONSchema7 } from 'json-schema';
import { IInstanceAdminContext } from '../../contexts/IInstanceAdminContext.ts';
import { IItemTypeOptions } from '../../values/IItemTypeOption.ts';
import { TDisplayName } from '../../values/TDisplayName.ts';
import { TId } from '../../values/TId.ts';
import { TName } from '../../values/TName.ts';

/**
 * アイテムの種類を表すエンティティクラス。
 */
export interface IItemType {
  readonly __brand: 'IItemType';

  /**
   * アイテムの種類のID。
   */
  readonly id: TId<IItemType>;

  /**
   * アイテムの種類の名前（単数形）。
   */
  readonly nameSingular: TName;

  /**
   * アイテムの種類の名前（複数形）。
   */
  readonly namePlural: TName;

  /**
   * アイテムの種類の表示名。
   */
  readonly displayName: TDisplayName;

  /**
   * アイテムの種類のスキーマ。
   */
  readonly schema: JSONSchema7;

  /**
   * アイテムのオプション。
   */
  readonly options: IItemTypeOptions;

  /**
   * アイテムの種類の情報を変更する。
   * @param newItemType 変更後の値。
   * @param instanceAdminContext この操作を行おうとしているユーザーがインスタンスの管理者の所属ユーザーであることを示す情報。
   */
  updateItemType(
    newItemType: Pick<
      IItemType,
      'id' | 'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'options'
    >,
    instanceAdminContext: IInstanceAdminContext,
  ): IItemType;
}
