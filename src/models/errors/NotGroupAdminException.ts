import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * グループの管理者のみが行える操作を、それ以外のユーザーが行おうとした際に発生する例外。
 */
export class NotGroupAdminException extends SbullasyErrorOrException {
  public readonly name = 'NotGroupAdminException';
}
