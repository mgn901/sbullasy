import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class InvalidItemBodyException extends SbullasyErrorOrException {
  public readonly name = 'InvalidItemBodyException';
}
