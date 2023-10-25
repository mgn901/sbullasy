import { UserShelfImpl } from '../../../models/entities-impl/user-shelf/UserShelfImpl.ts';
import { UserImpl } from '../../../models/entities-impl/user/UserImpl.ts';
import { IEmailVerification } from '../../../models/entities/user/IEmailVerification.ts';
import { NotFoundException } from '../../../models/errors/NotFoundException.ts';
import { TEmail } from '../../../models/values/TEmail.ts';
import { IImplementations } from '../IImplementations.ts';

/**
 * ログインに使用するメール認証を作成する。
 * ユーザーが存在する場合は、メール認証を作成する。
 * ユーザーが存在しない場合は、先にユーザーを作成してからメール認証を作成する。
 * @param email ログインしようとしているユーザーのメールアドレス。
 * @param implementations この操作に使用するインフラストラクチャの実装。
 * @returns 作成したメール認証のエンティティオブジェクト。
 */
export const createUserOrCreateCookieEmailVerification = async (
  email: TEmail,
  implementations: IImplementations,
): Promise<IEmailVerification<'createCookieToken'>> => {
  const user = await (async () => {
    try {
      const getResult = await implementations.userRepository.getOneByEmailOrThrow(email);
      return getResult;
    } catch (e) {
      if (!(e instanceof NotFoundException)) {
        throw e;
      }
      const newUser = new UserImpl({ email });
      return newUser;
    }
  })();

  const verification = user.createEmailVerificationForCookieToken();

  await implementations.userRepository.saveOne(user, true);
  try {
    await implementations.userShelfRepository.getOneByIdOrThrow(user.id);
  } catch (e) {
    if (!(e instanceof NotFoundException)) {
      throw e;
    }
    const newUserShelf = new UserShelfImpl(user);
    await implementations.userShelfRepository.saveOne(newUserShelf, false);
  }

  return verification;
};
