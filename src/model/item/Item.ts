import type { TNominalPrimitive } from '../../utils/primitives/TNominalPrimitive.ts';
import type { TId } from '../../utils/random-values/TId.ts';

const itemTypeSymbol = Symbol('itemTypeSymbol');

export interface IItemProperties {
  readonly id: TNominalPrimitive<TId, typeof itemTypeSymbol>;
}
