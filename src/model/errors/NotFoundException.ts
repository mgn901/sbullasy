import { ApplicationErrorOrException } from './ApplicationErrorOrException.ts';

export class NotFoundException extends ApplicationErrorOrException {
  public readonly name = 'NotFoundException';
}
