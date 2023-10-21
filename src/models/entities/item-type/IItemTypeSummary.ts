import { IItemType } from './IItemType.ts';

/**
 * アイテムの種類の要約を表すエンティティクラス。
 */
export type IItemTypeSummary = {
  readonly __brand: 'IItemTypeSummary';
} & Pick<IItemType, 'id' | 'nameSingular' | 'namePlural' | 'displayName'>;
