import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * 有効なプロフィールを持つユーザーのみが行える操作を、プロフィールが期限切れになっているユーザーが行おうとした際に発生する例外。
 */
export class UserProfileExpiredException extends SbullasyErrorOrException {
  public readonly name = 'UserProfileExpiredException';
}
