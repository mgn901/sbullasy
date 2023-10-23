import { IValidEmailVerificationAnswerContext } from '../../context/IValidEmailVerificationAnswerContext.ts';
import { ISelfContext } from '../../context/ISelfContext.ts';
import { IUserProfile } from '../../entities/user-profile/IUserProfile.ts';
import { IUser } from '../../entities/user/IUser.ts';
import { InternalContextValidationError } from '../../errors/InternalContextValidationError.ts';

/**
 * {@linkcode IUserProfile}の抽象クラスとしての実装。
 * 不正なインスタンス化を防ぐため、具象クラスを勝手に実装してはならない。
 */
export abstract class UserProfileBase implements IUserProfile {
  public readonly __brand = 'IUserProfile';

  public readonly id: IUserProfile['id'];

  private _name: IUserProfile['name'];

  private _displayName: IUserProfile['displayName'];

  private _expiresAt: IUserProfile['expiresAt'];

  private _belongsTo: IUserProfile['belongsTo'];

  public constructor(
    userProfile: Pick<IUserProfile, 'id' | 'name' | 'displayName' | 'expiresAt' | 'belongsTo'>,
  ) {
    this.id = userProfile.id;
    this._name = userProfile.name;
    this._displayName = userProfile.displayName;
    this._expiresAt = userProfile.expiresAt;
    this._belongsTo = userProfile.belongsTo;
  }

  public get name() {
    return this._name;
  }

  public get displayName() {
    return this._displayName;
  }

  public get expiresAt() {
    return this._expiresAt;
  }

  public get belongsTo() {
    return this._belongsTo;
  }

  public updateUserProfile(
    newUserProfile: Pick<IUserProfile, 'name' | 'displayName'>,
    selfContext: ISelfContext,
  ): void {
    this.validateSelfContextOrThrow(selfContext);
    this._name = newUserProfile.name;
    this._displayName = newUserProfile.displayName;
  }

  public isValidAt(date: Date): boolean {
    return !!this.expiresAt && date < this.expiresAt;
  }

  public setExpiresAt(
    emailVerificationContext: IValidEmailVerificationAnswerContext<'setProfileExpiresAt'>,
    selfContext: ISelfContext,
    user: IUser,
  ): void {
    if (user.id !== this.id) {
      throw new InternalContextValidationError();
    }
    user.validateValidEmailVerificationAnswerContextOrThrow(emailVerificationContext);
    this.validateSelfContextOrThrow(selfContext);
    const now = new Date();
    this._expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }

  public validateSelfContextOrThrow(context: ISelfContext): void {
    if (context.userId !== this.id) {
      throw new InternalContextValidationError();
    }
  }
}
