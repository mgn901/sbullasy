import { SbullasyErrorOrException } from './SbullasyErrorOrException.ts';

export class NoPermissionException extends SbullasyErrorOrException {
  public readonly name = 'NoPermissionException';
}
