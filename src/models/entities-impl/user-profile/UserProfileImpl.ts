import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IValidEmailVerificationAnswerContext } from '../../contexts/IValidEmailVerificationAnswerContext.ts';
import { IUserProfile } from '../../entities/user-profile/IUserProfile.ts';
import { IUser } from '../../entities/user/IUser.ts';
import { UserProfileBase } from './UserProfileBase.ts';

/**
 * {@linkcode UserProfileBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class UserProfileImpl extends UserProfileBase {
  public constructor(
    userProfile: Pick<IUserProfile, 'name' | 'displayName'>,
    user: IUser,
    validvalidEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'setProfileExpiresAt'>,
    selfContext: ISelfContext,
  ) {
    user.validateValidEmailVerificationAnswerContextOrThrow(
      validvalidEmailVerificationAnswerContext,
      'setProfileExpiresAt',
    );
    user.validateSelfContextOrThrow(selfContext);

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
