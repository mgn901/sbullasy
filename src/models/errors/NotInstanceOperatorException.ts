import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * インスタンスのオペレーターの所属ユーザーのみが行える操作を、それ以外のユーザーが行おうとした際に発生する例外。
 */
export class NotInstanceOperatorException extends SbullasyErrorOrException {
  public readonly name = 'NotInstanceOperatorException';
}
