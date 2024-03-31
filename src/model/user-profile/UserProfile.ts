import { Success, type TResult } from '../../utils/result.ts';
import type {
  EmailVerificationPassedCertificate,
  IEmailVerificationPassedCertificateProperties,
} from '../certificates/EmailVerificationPassedCertificate.ts';
import type { MyselfCertificate } from '../certificates/MyselfCertificate.ts';
import { USER_PROFILE_EXPIRATION_MS } from '../constants.ts';
import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';
import type { MemberWithGroupProfile } from '../group-member-directory/MemberWithGroupProfile.ts';
import type { IMemberWithGroupProfileRepositoryGetManyParams } from '../repositories/IMemberWithGroupProfileRepository.ts';
import type { IUserProfileRepositoryGetOneByIdParams } from '../repositories/IUserProfileRepository.ts';
import type { IUserProperties } from '../user/User.ts';
import type { TDisplayName } from '../values/TDisplayName.ts';
import type { TName } from '../values/TName.ts';

const userProfileTypeSymbol = Symbol('userProfileTypeSymbol');

export interface IUserProfileProperties {
  readonly id: IUserProperties['id'];
  readonly name: TName;
  readonly displayName: TDisplayName;
  readonly expiresAt: Date;
}

export class UserProfile<
  Id extends IUserProfileProperties['id'] = IUserProfileProperties['id'],
  Name extends IUserProfileProperties['name'] = IUserProfileProperties['name'],
  DisplayName extends IUserProfileProperties['displayName'] = IUserProfileProperties['displayName'],
  ExpiresAt extends IUserProfileProperties['expiresAt'] = IUserProfileProperties['expiresAt'],
> {
  public readonly [userProfileTypeSymbol]: unknown;
  public readonly id: Id;
  public readonly name: Name;
  public readonly displayName: DisplayName;
  public readonly expiresAt: ExpiresAt;

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
    readonly userProfile: UserProfile<Id, Name, DisplayName, IUserProfileProperties['expiresAt']>;
  }> {
    return new Success({
      userProfile: UserProfile.fromParam({
        id: param.id,
        name: param.name,
        displayName: param.displayName,
        expiresAt: new Date(Date.now() + USER_PROFILE_EXPIRATION_MS),
      }),
    });
  }

  public static createGetByIdRequest<Id extends IUserProfileProperties['id']>(param: {
    readonly id: Id;
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly daoRequest: IUserProfileRepositoryGetOneByIdParams<Id>;
  }> {
    return new Success({
      daoRequest: { id: param.id },
    });
  }

  public createGetBelongsToRequest(param: {
    readonly myselfCertificate: MyselfCertificate<Id>;
    readonly options: IMemberWithGroupProfileRepositoryGetManyParams<
      MemberWithGroupProfile,
      Record<never, never>
    >['options'];
  }): TResult<{
    readonly daoRequest: IMemberWithGroupProfileRepositoryGetManyParams<
      MemberWithGroupProfile,
      { readonly userId: Id }
    >;
  }> {
    return new Success({
      daoRequest: {
        query: { userId: this.id },
        options: param.options,
      },
    });
  }

  public isValidAt(param: {
    readonly date?: Date;
  }): Success<{
    readonly isValid: boolean;
  }> {
    return new Success({ isValid: (param.date ?? new Date()) < this.expiresAt });
  }

  public toBodySet<
    NewName extends IUserProfileProperties['name'],
    NewDisplayName extends IUserProfileProperties['displayName'],
  >(param: {
    readonly name: NewName;
    readonly displayName: NewDisplayName;
    readonly myselfCertificate: MyselfCertificate<Id>;
  }): Success<{
    readonly userProfile: UserProfile<Id, NewName, NewDisplayName, ExpiresAt>;
  }> {
    return new Success({
      userProfile: UserProfile.fromParam({
        id: this.id,
        name: param.name,
        displayName: param.displayName,
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
    readonly userProfile: UserProfile<Id, Name, DisplayName, IUserProfileProperties['expiresAt']>;
  }> {
    return new Success({
      userProfile: UserProfile.fromParam({
        id: this.id,
        name: this.name,
        displayName: this.displayName,
        expiresAt: new Date(Date.now() + USER_PROFILE_EXPIRATION_MS),
      }),
    });
  }

  public static fromParam<
    Id extends IUserProfileProperties['id'],
    Name extends IUserProfileProperties['name'],
    DisplayName extends IUserProfileProperties['displayName'],
    ExpiresAt extends IUserProfileProperties['expiresAt'],
  >(
    param: Pick<UserProfile<Id, Name, DisplayName, ExpiresAt>, keyof IUserProfileProperties>,
  ): UserProfile<Id, Name, DisplayName, ExpiresAt> {
    return new UserProfile(param);
  }

  private constructor(
    param: Pick<UserProfile<Id, Name, DisplayName, ExpiresAt>, keyof IUserProfileProperties>,
  ) {
    this.id = param.id;
    this.name = param.name;
    this.displayName = param.displayName;
    this.expiresAt = param.expiresAt;
  }
}

export class UserProfileExpiredException extends ApplicationErrorOrException {
  public readonly name = 'UserProfileExpiredException';
}
