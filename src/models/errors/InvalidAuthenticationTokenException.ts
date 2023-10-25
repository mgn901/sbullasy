import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class InvalidAuthenticationTokenException extends SbullasyErrorOrException {
  public readonly name = 'InvalidAuthenticationTokenException';
}
