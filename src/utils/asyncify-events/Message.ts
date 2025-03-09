import type { Id } from '../../model/lib/random-values/id.ts';
import type { NominalPrimitive } from '../type-utils.ts';

const messageTypeSymbol = Symbol();

export interface Request<TFunc extends (this: unknown, ...args: never[]) => TReturned, TReturned> {
  readonly id: NominalPrimitive<Id, typeof messageTypeSymbol>;
  readonly args: Readonly<Parameters<TFunc>>;
}

export interface Response<TFunc extends (this: unknown, ...args: never[]) => TReturned, TReturned> {
  readonly id: NominalPrimitive<Id, typeof messageTypeSymbol>;
  readonly returned: TReturned;
}
