import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class EmailVerificationExpiredException extends SbullasyErrorOrException {
  public readonly name = 'EmailVerificationExpiredException';
}
