import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * ユーザー本人のみが行える操作を、それ以外のユーザーが行おうとした際に発生する例外。
 */
export class NotSelfException extends SbullasyErrorOrException {
  public readonly name = 'NotSelfException';
}
