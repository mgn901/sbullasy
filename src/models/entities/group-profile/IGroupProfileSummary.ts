import { IGroupProfile } from './IGroupProfile.ts';

/**
 * グループのプロフィールの要約を表すエンティティクラス。
 */
export type IGroupProfileSummary = {
  readonly __brand: 'IGroupProfileSummary';
} & Pick<IGroupProfile, 'id' | 'name' | 'displayName' | 'badges'>;
