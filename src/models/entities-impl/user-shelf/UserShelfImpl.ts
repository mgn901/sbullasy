import { ArrayWithDiff } from '../../../utils/ArrayWithDiff.ts';
import { IUser } from '../../entities/user/IUser.ts';
import { UserShelfBase } from './UserShelfBase.ts';

/**
 * {@linkcode UserShelfBase}の具象クラスで、正しいインスタンスを生成できるコンストラクタを持つ。
 */
export class UserShelfImpl extends UserShelfBase {
  public constructor(user: IUser) {
    super({
      id: user.id,
      bookmarks: new ArrayWithDiff(),
    });
  }
}
