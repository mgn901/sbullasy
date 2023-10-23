import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class InvalidEmailVerificationAnswerException extends SbullasyErrorOrException {
  public readonly name = 'InvalidEmailVerificationAnswerException';
}
