import { ArrayWithDiff } from '../../../utils/ArrayWithDiff.ts';
import { IUser } from '../../entities/user/IUser.ts';
import { generateId } from '../../values/TId.ts';
import { UserBase } from './UserBase.ts';

/**
 * {@linkcode UserBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class UserImpl extends UserBase {
  public constructor(user: Pick<IUser, 'email'>) {
    super({
      id: generateId(),
      email: user.email,
      registeredAt: undefined,
      tokens: new ArrayWithDiff(),
      _emailVerifications: new ArrayWithDiff(),
    });
  }
}
