import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type { Id } from '../../lib/random-values/id.ts';

export const userTypeSymbol = Symbol();

export type UserId = NominalPrimitive<Id, typeof userTypeSymbol>;
