import { JSONSchema7 } from 'json-schema';
import { IInstanceAdminContext } from '../../context/IInstanceAdminContext.ts';
import { IItemTypeOption } from '../../values/IItemTypeOption.ts';
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
  nameSingular: TName;

  /**
   * アイテムの種類の名前（複数形）。
   */
  namePlural: TName;

  /**
   * アイテムの種類の表示名。
   */
  displayName: TDisplayName;

  /**
   * アイテムの種類のスキーマ。
   */
  schema: JSONSchema7;

  /**
   * アイテムのオプション。
   */
  option: IItemTypeOption;

  /**
   * アイテムの種類の情報を変更する。
   * @param itemType 変更後の値。
   * @param instanceAdminContext 操作しているのがインスタンスの管理者であることを示す情報。
   */
  updateItemType(
    itemType: Pick<
      IItemType,
      'id' | 'nameSingular' | 'namePlural' | 'displayName' | 'schema' | 'option'
    >,
    instanceAdminContext: IInstanceAdminContext,
  ): void;
}
