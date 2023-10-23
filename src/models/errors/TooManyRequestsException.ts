import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class TooManyRequestsException extends SbullasyErrorOrException {
  public readonly name = 'TooManyRequestsException';
}
