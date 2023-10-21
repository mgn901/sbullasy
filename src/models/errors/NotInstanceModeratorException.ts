import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * インスタンスのモデレーターの所属ユーザーのみが行える操作を、それ以外のユーザーが行おうとした際に発生する例外。
 */
export class NotInstanceModeratorException extends SbullasyErrorOrException {
  public readonly name = 'NotInstanceModeratorException';
}
