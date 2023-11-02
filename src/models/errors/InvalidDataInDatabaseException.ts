import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class InvalidDataInDatabaseException extends SbullasyErrorOrException {
  public readonly name = 'InvalidDataInDatabaseException';
}
