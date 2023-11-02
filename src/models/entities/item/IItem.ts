import { IItemOwnerContext } from '../../contexts/IItemOwnerContext.ts';
import { IItemBody } from '../../values/IItemBody.ts';
import { TId } from '../../values/TId.ts';
import { TTitle } from '../../values/TTitle.ts';
import { TTitleForUrl } from '../../values/TTitleForUrl.ts';
import { IGroupProfileSummary } from '../group-profile/IGroupProfileSummary.ts';
import { IItemType } from '../item-type/IItemType.ts';
import { IItemTypeSummary } from '../item-type/IItemTypeSummary.ts';

/**
 * アイテムを表すエンティティクラス。
 *
 * グループはアイテムを作成することができる。
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
  readonly title: TTitle;

  /**
   * アイテムのタイトルのURL用表現。
   */
  readonly titleForUrl: TTitleForUrl;

  /**
   * アイテムの作成日時。
   */
  readonly createdAt: Date;

  /**
   * アイテムの更新日時。
   */
  readonly updatedAt: Date;

  /**
   * アイテムの公開日時。
   */
  readonly publishedAt: Date | undefined;

  /**
   * アイテムの所有者。
   */
  readonly owner: IGroupProfileSummary;

  /**
   * アイテムの種類
   */
  readonly type: IItemTypeSummary;

  /**
   * アイテムの中身。
   */
  readonly body: IItemBody;

  /**
   * アイテムの情報を変更する。
   * @param newItem 変更後の値。
   * @param type
   * @param itemOwnerContext この操作を行おうとしているユーザーがアイテムの所有グループの所属ユーザーであることを示す情報。
   */
  updateItem(
    newItem: Pick<IItem, 'title' | 'titleForUrl' | 'publishedAt' | 'body'>,
    type: IItemType,
    itemOwnerContext: IItemOwnerContext,
  ): IItem;

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
