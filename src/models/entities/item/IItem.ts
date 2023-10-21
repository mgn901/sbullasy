import { IItemOwnerContext } from '../../contexts/IItemOwnerContext.ts';
import { IItemBody } from '../../values/IItemBody.ts';
import { TDisplayName } from '../../values/TDisplayName.ts';
import { TId } from '../../values/TId.ts';
import { IGroupProfile } from '../group-profile/IGroupProfile.ts';

/**
 * アイテムを表すエンティティクラス。
 */
export interface IItem {
  readonly __brand: 'IItem';

  /**
   * アイテムのID。
   */
  readonly id: TId<IItem>;

  /**
   * アイテムの表示名。
   */
  displayName: TDisplayName;

  /**
   * アイテムの作成日時。
   */
  readonly createdAt: Date;

  /**
   * アイテムの更新日時。
   */
  updatedAt: Date;

  /**
   * アイテムの公開日時。
   */
  publishedAt: Date | undefined;

  /**
   * アイテムの中身。
   */
  body: IItemBody;

  /**
   * アイテムの所有者。
   */
  readonly owner: IGroupProfile;

  /**
   * アイテムの情報を変更する。
   * @param item 変更後の値。
   * @param itemOwnerContext 変更しようとしているのがアイテムの所有グループであることを示す情報。
   */
  updateItem(
    item: Pick<IItem, 'displayName' | 'publishedAt' | 'body'>,
    itemOwnerContext: IItemOwnerContext,
  ): void;

  /**
   * 指定した日時においてアイテムが公開されているかどうか。
   * @param date 日時の指定。この日時においてアイテムが公開されているかどうかを返す。
   */
  isPublishedAt(date: Date): boolean;
}
