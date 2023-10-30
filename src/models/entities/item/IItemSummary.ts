import { IGroupProfileSummary } from '../group-profile/IGroupProfileSummary.ts';
import { IItem } from './IItem.ts';

/**
 * アイテムの要約を表すエンティティクラス。
 */
export type IItemSummary = {
  readonly __brand: 'IItemSummary';
  readonly owner: Readonly<IGroupProfileSummary>;
} & Pick<IItem, 'id' | 'title' | 'titleForUrl' | 'updatedAt' | 'publishedAt' | 'owner' | 'body'>;
