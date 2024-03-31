import type { IUserProperties } from '../user/User.ts';

const belongsToNoGroupCertificateTypeSymbol = Symbol('belongsToNoGroupCertificate');

export interface IBelongsToNoGroupCertificateProperties {
  readonly userId: IUserProperties['id'];
}

export class BelongsToNoGroupCertificate<
  UserId extends IBelongsToNoGroupCertificateProperties['userId'],
> {
  public readonly [belongsToNoGroupCertificateTypeSymbol]: unknown;
  public readonly userId: UserId;

  public static fromParam<UserId extends IBelongsToNoGroupCertificateProperties['userId']>(
    param: Pick<BelongsToNoGroupCertificate<UserId>, keyof IBelongsToNoGroupCertificateProperties>,
  ) {
    return new BelongsToNoGroupCertificate(param);
  }

  private constructor(
    param: Pick<BelongsToNoGroupCertificate<UserId>, keyof IBelongsToNoGroupCertificateProperties>,
  ) {
    this.userId = param.userId;
  }
}
