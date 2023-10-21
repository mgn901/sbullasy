import { IItem } from './IItem.ts';

/**
 * アイテムの要約を表すエンティティクラス。
 */
export type IItemSummary = {
  readonly __brand: 'IItemSummary';
} & Pick<IItem, 'id' | 'displayName' | 'updatedAt' | 'publishedAt' | 'owner' | 'body'>;
