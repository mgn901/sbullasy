import { ApplicationErrorOrException } from '../errors/ApplicationErrorOrException.ts';

export type IDaoRequestQuery<E> = {
  readonly [K in keyof E]?: readonly (readonly ['===' | '!==' | '<' | '>', E[K]])[] | E[K];
};

export interface IDaoRequestOptions<E, P extends keyof E = keyof E> {
  readonly orderBy?: {
    readonly property: P;
    readonly direction: 'asc' | 'desc';
  };
  readonly limit?: number;
  readonly offset?: number;
  readonly cursor?: P;
}

export class DaoException extends ApplicationErrorOrException {
  public readonly name = 'DaoException';
}

export class NotFoundOnRepositoryException extends ApplicationErrorOrException {
  public readonly name = 'NotFoundOnRepositoryException';
}
