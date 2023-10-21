import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * グループの所属ユーザーのみが行える操作を、それ以外のユーザーが行おうとした際に発生する例外。
 */
export class NotGroupMemberException extends SbullasyErrorOrException {
  public readonly name = 'NotGroupMemberException';
}
