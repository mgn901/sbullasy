import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * インスタンスの管理者の所属ユーザーのみが行える操作を、それ以外のユーザーが行おうとした際に発生する例外。
 */
export class NotInstanceAdminException extends SbullasyErrorOrException {
  public readonly name = 'NotInstanceAdminException';
}
