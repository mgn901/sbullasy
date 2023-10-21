import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * アイテムの所有者の所属ユーザーのみが行える操作を、それ以外のユーザーが行おうとした際に発生する例外。
 */
export class NotItemOwnerException extends SbullasyErrorOrException {
  public readonly name = 'NotItemOwnerException';
}
