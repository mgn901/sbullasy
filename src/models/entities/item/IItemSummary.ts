import { IItem } from './IItem.ts';

/**
 * アイテムの要約を表すエンティティクラス。
 */
export type IItemSummary = {
  readonly __brand: 'IItemSummary';
} & Pick<IItem, 'id' | 'title' | 'titleForUrl' | 'updatedAt' | 'publishedAt' | 'owner' | 'body'>;
