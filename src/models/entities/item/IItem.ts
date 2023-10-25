import { IItemOwnerContext } from '../../contexts/IItemOwnerContext.ts';
import { IItemBody } from '../../values/IItemBody.ts';
import { TId } from '../../values/TId.ts';
import { TTitle } from '../../values/TTitle.ts';
import { TTitleForUrl } from '../../values/TTitleForUrl.ts';
import { IGroupProfile } from '../group-profile/IGroupProfile.ts';
import { IItemTypeSummary } from '../item-type/IItemTypeSummary.ts';

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
   * アイテムのタイトル。
   */
  title: TTitle;

  /**
   * アイテムのタイトルのURL用表現。
   */
  titleForUrl: TTitleForUrl;

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
   * アイテムの所有者。
   */
  readonly owner: IGroupProfile;

  /**
   * アイテムの種類
   */
  readonly type: IItemTypeSummary;

  /**
   * アイテムの中身。
   */
  body: IItemBody;

  /**
   * アイテムの情報を変更する。
   * @param newItem 変更後の値。
   * @param itemOwnerContext 変更しようとしているのがアイテムの所有グループであることを示す情報。
   */
  updateItem(
    newItem: Pick<IItem, 'title' | 'titleForUrl' | 'publishedAt' | 'body'>,
    itemOwnerContext: IItemOwnerContext,
  ): void;

  /**
   * 指定した日時においてアイテムが公開されているかどうか。
   * @param date 日時の指定。この日時においてアイテムが公開されているかどうかを返す。
   */
  isPublishedAt(date: Date): boolean;

  /**
   * 第1引数に渡したcontextがこのアイテムを操作するのに有効であるかを確認する。
   * @param context 有効であるかを確認するcontext。
   */
  validateItemOwnerContextOrThrow(context: IItemOwnerContext): void;
}
