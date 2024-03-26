import { Success } from '../../utils/result.ts';
import type {
  EmailVerificationPassedCertificate,
  IEmailVerificationPassedCertificateProperties,
} from '../certificates/EmailVerificationPassedCertificate.ts';
import type { MyselfCertificate } from '../certificates/MyselfCertificate.ts';
import { USER_PROFILE_EXPIRATION_MS } from '../constants.ts';
import type { IGroupProperties } from '../group/Group.ts';
import type { IUserProperties } from '../user/User.ts';
import type { TDisplayName } from '../values/TDisplayName.ts';
import type { TName } from '../values/TName.ts';

const userProfileTypeSymbol = Symbol('userProfileTypeSymbol');

export interface IUserProfileProperties {
  readonly id: IUserProperties['id'];
  readonly name: TName;
  readonly displayName: TDisplayName;
  readonly expiresAt: Date;
  readonly belongsTo: readonly IGroupProperties['id'][];
}

export class UserProfile<
  Id extends IUserProfileProperties['id'] = IUserProfileProperties['id'],
  Name extends IUserProfileProperties['name'] = IUserProfileProperties['name'],
  DisplayName extends IUserProfileProperties['displayName'] = IUserProfileProperties['displayName'],
  ExpiresAt extends IUserProfileProperties['expiresAt'] = IUserProfileProperties['expiresAt'],
  BelongsTo extends IUserProfileProperties['belongsTo'] = IUserProfileProperties['belongsTo'],
> {
  public readonly [userProfileTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly name: Name;
  public readonly displayName: DisplayName;
  public readonly expiresAt: ExpiresAt;
  public readonly belongsTo: BelongsTo;

  public static create<
    Id extends IUserProfileProperties['id'],
    Name extends IUserProfileProperties['name'],
    DisplayName extends IUserProfileProperties['displayName'],
  >(param: {
    readonly id: Id;
    readonly name: Name;
    readonly displayName: DisplayName;
    readonly myselfCertificate: MyselfCertificate<Id>;
    readonly emailVerificationPassedCertificate: EmailVerificationPassedCertificate<
      Id,
      IEmailVerificationPassedCertificateProperties['email'],
      'userProfile:create'
    >;
  }): Success<{
    readonly userProfile: UserProfile<
      Id,
      Name,
      DisplayName,
      IUserProfileProperties['expiresAt'],
      readonly []
    >;
  }> {
    return new Success({
      userProfile: UserProfile.fromParam({
        id: param.id,
        name: param.name,
        displayName: param.displayName,
        expiresAt: new Date(Date.now() + USER_PROFILE_EXPIRATION_MS),
        belongsTo: [] as const,
      }),
    });
  }

  public toBodySet<
    NewName extends IUserProfileProperties['name'],
    NewDisplayName extends IUserProfileProperties['displayName'],
  >(param: {
    readonly name: NewName;
    readonly displayName: NewDisplayName;
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly userProfile: UserProfile<Id, NewName, NewDisplayName, ExpiresAt, BelongsTo>;
  }> {
    return new Success({
      userProfile: UserProfile.fromParam({
        id: this.id,
        name: param.name,
        displayName: param.displayName,
        belongsTo: this.belongsTo,
        expiresAt: this.expiresAt,
      }),
    });
  }

  public toExpirationExtended(param: {
    readonly myselfCertificate: MyselfCertificate<Id>;
    readonly emailVerificationPassedCertificate: EmailVerificationPassedCertificate<
      Id,
      IEmailVerificationPassedCertificateProperties['email'],
      'userProfile:create'
    >;
  }): Success<{
    readonly userProfile: UserProfile<
      Id,
      Name,
      DisplayName,
      IUserProfileProperties['expiresAt'],
      BelongsTo
    >;
  }> {
    return new Success({
      userProfile: UserProfile.fromParam({
        id: this.id,
        name: this.name,
        displayName: this.displayName,
        belongsTo: this.belongsTo,
        expiresAt: new Date(Date.now() + USER_PROFILE_EXPIRATION_MS),
      }),
    });
  }

  public static fromParam<
    Id extends IUserProfileProperties['id'],
    Name extends IUserProfileProperties['name'],
    DisplayName extends IUserProfileProperties['displayName'],
    ExpiresAt extends IUserProfileProperties['expiresAt'],
    BelongsTo extends IUserProfileProperties['belongsTo'],
  >(
    param: Pick<
      UserProfile<Id, Name, DisplayName, ExpiresAt, BelongsTo>,
      keyof IUserProfileProperties
    >,
  ): UserProfile<Id, Name, DisplayName, ExpiresAt, BelongsTo> {
    return new UserProfile(param);
  }

  private constructor(
    param: Pick<
      UserProfile<Id, Name, DisplayName, ExpiresAt, BelongsTo>,
      keyof IUserProfileProperties
    >,
  ) {
    this.id = param.id;
    this.name = param.name;
    this.displayName = param.displayName;
    this.expiresAt = param.expiresAt;
    this.belongsTo = param.belongsTo;
  }
}
