import { IItem } from '../entities/item/IItem.ts';

/**
 * 操作を行おうとしているユーザーが、操作対象のアイテムの所有者の所属ユーザーであることを示す情報。
 */
export interface IItemOwnerContext {
  readonly __brand: 'IItemOwnerContext';

  /**
   * 操作対象のアイテムのアイテムID。
   */
  readonly itemId: IItem['id'];
}
