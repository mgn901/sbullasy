import { IUserProfile } from '../../entities/user-profile/IUserProfile.ts';
import { IUser } from '../../entities/user/IUser.ts';
import { UserProfileBase } from './UserProfileBase.ts';

/**
 * {@linkcode UserProfileBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class UserProfileImpl extends UserProfileBase {
  public constructor(user: IUser, userProfile: Pick<IUserProfile, 'name' | 'displayName'>) {
    const now = new Date();
    super({
      id: user.id,
      name: userProfile.name,
      displayName: userProfile.displayName,
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      belongsTo: [],
    });
  }
}
