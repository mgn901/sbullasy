import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class NotFoundException extends SbullasyErrorOrException {
  public readonly name = 'NotFoundException';
}
