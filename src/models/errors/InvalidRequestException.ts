import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class InvalidRequestException extends SbullasyErrorOrException {
  public readonly name = 'InvalidRequestException';
}
