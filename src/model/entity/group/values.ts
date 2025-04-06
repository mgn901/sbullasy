import type { NominalPrimitive } from '../../../utils/type-utils.ts';
import type { Id } from '../../lib/random-values/id.ts';

export const groupTypeSymbol = Symbol('group.type');

export type GroupId = NominalPrimitive<Id, typeof groupTypeSymbol>;
