import { MyselfCertificate } from '../../model/certificates/MyselfCertificate.ts';
import { ApplicationErrorOrException } from '../../model/errors/ApplicationErrorOrException.ts';
import type {
  DaoException,
  NotFoundOnRepositoryException,
} from '../../model/repositories/dao-types.ts';
import type { IAuthenticationTokenProperties } from '../../model/user-account/AuthenticationToken.ts';
import type { IUserProperties } from '../../model/user/User.ts';
import { Failure, Success, type TResult } from '../../utils/result.ts';
import type { IImplementationContainer } from '../implementation-containers/IImplementationContainer.ts';

export const myselfCertificateService = async <UserId extends IUserProperties['id']>(param: {
  readonly userId: UserId;
  readonly authenticationTokenSecret: IAuthenticationTokenProperties['secret'];
  readonly implementationContainer: IImplementationContainer;
}): Promise<
  TResult<
    {
      readonly myselfCertificate: MyselfCertificate<UserId>;
    },
    IllegalAuthenticationTokenException | DaoException | NotFoundOnRepositoryException
  >
> => {
  const getAuthenticationTokenResult =
    await param.implementationContainer.authenticationTokenRepository.getOne({
      secret: param.authenticationTokenSecret,
    });
  if (getAuthenticationTokenResult instanceof Failure) {
    return getAuthenticationTokenResult;
  }

  if (
    getAuthenticationTokenResult.value.item === undefined ||
    getAuthenticationTokenResult.value.item.userId !== param.userId ||
    !getAuthenticationTokenResult.value.item.isValidAt({})
  ) {
    return new Failure(
      new IllegalAuthenticationTokenException({
        message: '認証の有無を確認できません。ログインしてからやり直してください。',
        isProbablyCausedByClientBug: true,
      }),
    );
  }

  return new Success({
    myselfCertificate: MyselfCertificate.fromParam({
      userId: param.userId ?? (getAuthenticationTokenResult.value.item.userId as UserId),
    }),
  });
};

export class IllegalAuthenticationTokenException extends ApplicationErrorOrException {
  public readonly name = 'IllegalAuthenticationTokenException';
}
