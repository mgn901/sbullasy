import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { Id } from '../../lib/random-values/id.ts';

export const userTypeSymbol = Symbol('user.type');

export type UserId = NominalPrimitive<Id, typeof userTypeSymbol>;
