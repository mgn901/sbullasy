import { createSelfContextOrThrow } from '../../../models/contexts/createSelfContextOrThrow.ts';
import { IEmailVerification } from '../../../models/entities/user/IEmailVerification.ts';
import { TEmailVerificationPurpose } from '../../../models/values/TEmailVerificationPurpose.ts';
import { TLongSecret } from '../../../models/values/TLongSecret.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * メール認証を作成する。
 * @param param 作成するメール認証の内容。
 * @param tokenSecret 操作を行おうとしているユーザーの認証用トークンのシークレット値。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 作成したメール認証のエンティティオブジェクト。
 */
export const createEmailVerification = async <
  F extends Exclude<TEmailVerificationPurpose, 'createCookieToken'>,
>(
  param: Pick<IEmailVerification<F>, 'email' | 'for'>,
  tokenSecret: TLongSecret,
  implementations: IImplementations,
): Promise<IEmailVerification<F>> => {
  const user =
    await implementations.userRepository.getOneByAuthenticationTokenSecretOrThrow(tokenSecret);

  const context = createSelfContextOrThrow(user);

  const { newUser, newEmailVerification } = user.createEmailVerification<F>(param, context);

  await implementations.userRepository.saveOne(newUser, true);

  return newEmailVerification;
};
