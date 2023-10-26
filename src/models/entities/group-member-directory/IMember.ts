import { IUserProfile } from '../user-profile/IUserProfile.ts';

/**
 * グループとグループの所属ユーザーの関係を表すエンティティクラス。
 */
export interface IMember {
  readonly __brand: 'IMember';

  /**
   * グループの所属ユーザー。
   */
  readonly user: IUserProfile;

  /**
   * グループとその所属ユーザーとの関係。
   * - `'admin'`: グループの管理者。
   * - `'default'`: 上記以外の所属ユーザー。
   */
  readonly type: 'admin' | 'default';
}
