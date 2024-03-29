import type { IUserProperties } from '../user/User.ts';

const myselfCertificateTypeSymbol = Symbol('myselfCertificateTypeSymbol');

export interface IMyselfCertificateProperties {
  readonly userId: IUserProperties['id'];
}

export class MyselfCertificate<UserId extends IMyselfCertificateProperties['userId']> {
  public readonly [myselfCertificateTypeSymbol]: unknown;
  public readonly userId: UserId;

  public static fromParam<UserId extends IMyselfCertificateProperties['userId']>(
    param: Pick<MyselfCertificate<UserId>, keyof IMyselfCertificateProperties>,
  ) {
    return new MyselfCertificate({ userId: param.userId });
  }

  private constructor(param: Pick<MyselfCertificate<UserId>, keyof IMyselfCertificateProperties>) {
    this.userId = param.userId;
  }
}
