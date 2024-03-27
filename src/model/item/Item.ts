import type { TNominalPrimitive } from '../../utils/primitive.ts';
import type { TId } from '../../utils/random-values/id.ts';

const itemTypeSymbol = Symbol('itemTypeSymbol');

export interface IItemProperties {
  readonly id: TNominalPrimitive<TId, typeof itemTypeSymbol>;
}
