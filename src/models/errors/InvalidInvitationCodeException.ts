import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

/**
 * グループに参加するのに無効な招待コードを用いようとした際に発生する例外。
 */
export class InvalidInvitationCodeException extends SbullasyErrorOrException {
  public readonly name = 'InvalidInvitationCodeException;';
}
