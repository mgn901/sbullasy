import { IValidEmailVerificationAnswerContext } from '../../contexts/IValidEmailVerificationAnswerContext.ts';
import { ISelfContext } from '../../contexts/ISelfContext.ts';
import { IUserProfile } from '../../entities/user-profile/IUserProfile.ts';
import { IUser } from '../../entities/user/IUser.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';
import { IValidUserProfileContext } from '../../contexts/IValidUserProfileContext.ts';

/**
 * {@linkcode IUserProfile}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
class UserProfileInternal implements IUserProfile {
  public readonly __brand = 'IUserProfile';

  public readonly id: IUserProfile['id'];

  public readonly name: IUserProfile['name'];

  public readonly displayName: IUserProfile['displayName'];

  public readonly expiresAt: IUserProfile['expiresAt'];

  public readonly belongsTo: IUserProfile['belongsTo'];

  public constructor(
    userProfile: Pick<IUserProfile, 'id' | 'name' | 'displayName' | 'expiresAt' | 'belongsTo'>,
  ) {
    this.id = userProfile.id;
    this.name = userProfile.name;
    this.displayName = userProfile.displayName;
    this.expiresAt = userProfile.expiresAt;
    this.belongsTo = userProfile.belongsTo;
  }

  public updateUserProfile(
    newUserProfile: Pick<IUserProfile, 'name' | 'displayName'>,
    selfContext: ISelfContext,
  ): IUserProfile {
    this.validateSelfContextOrThrow(selfContext);
    const { name, displayName } = newUserProfile;
    return new UserProfileInternal({ ...this, name, displayName });
  }

  public isValidAt(date: Date): boolean {
    return !!this.expiresAt && date < this.expiresAt;
  }

  public setExpiresAt(
    validEmailVerificationAnswerContext: IValidEmailVerificationAnswerContext<'setProfileExpiresAt'>,
    selfContext: ISelfContext,
    user: IUser,
  ): { newUserProfile: IUserProfile; newUser: IUser } {
    if (user.id !== this.id) {
      throw new InternalContextValidationError();
    }
    const newUser = user.validateValidEmailVerificationAnswerContextOrThrow(
      validEmailVerificationAnswerContext,
      'setProfileExpiresAt',
    );
    this.validateSelfContextOrThrow(selfContext);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    return { newUserProfile: new UserProfileInternal({ ...this, expiresAt }), newUser };
  }

  public validateSelfContextOrThrow(context: ISelfContext): void {
    if (context.userId !== this.id) {
      throw new InternalContextValidationError();
    }
  }

  public validateValidUserProfileContextOrThrow(context: IValidUserProfileContext): void {
    if (context.userId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}

export abstract class UserProfileBase extends UserProfileInternal {}
