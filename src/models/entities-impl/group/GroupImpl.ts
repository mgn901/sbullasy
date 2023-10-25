import { IValidUserProfileContext } from '../../contexts/IValidUserProfileContext.ts';
import { IUserProfile } from '../../entities/user-profile/IUserProfile.ts';
import { generateId } from '../../values/TId.ts';
import { GroupBase } from './GroupBase.ts';

/**
 * {@linkcode GroupBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class GroupImpl extends GroupBase {
  public constructor(validUserProfileContext: IValidUserProfileContext, userProfile: IUserProfile) {
    userProfile.validateValidUserProfileContextOrThrow(validUserProfileContext);

    const now = new Date();

    super({
      id: generateId(),
      createdAt: now,
      instanceRole: 'default',
    });
  }
}
