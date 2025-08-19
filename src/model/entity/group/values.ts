import type { NominalPrimitive } from '@mgn901/mgn901-utils-ts/nominal-primitive.type';
import type { Id } from '../../lib/random-values/id.ts';

export const groupTypeSymbol = Symbol('group.type');

export type GroupId = NominalPrimitive<Id, typeof groupTypeSymbol>;
